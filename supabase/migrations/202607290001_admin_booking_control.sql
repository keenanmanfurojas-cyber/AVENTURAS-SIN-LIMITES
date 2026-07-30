begin;

alter table public.bookings
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid,
  add column if not exists archive_reason text;

do $$
begin
  if exists (
    select 1 from public.admin_profiles
    where role not in ('admin', 'superadmin')
  ) then
    raise exception 'UNSUPPORTED_ADMIN_ROLE';
  end if;
end;
$$;

alter table public.bookings
  drop constraint if exists bookings_archived_by_fkey;
alter table public.bookings
  add constraint bookings_archived_by_fkey
  foreign key (archived_by) references public.admin_profiles(id)
  on update restrict on delete restrict;

alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;
alter table public.admin_profiles
  add constraint admin_profiles_role_check
  check (role in ('admin', 'superadmin')) not valid;
alter table public.admin_profiles
  validate constraint admin_profiles_role_check;

alter table public.admin_actions
  add column if not exists previous_values jsonb,
  add column if not exists new_values jsonb;

create table if not exists public.booking_deletion_tombstones (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null,
  deleted_by uuid not null references public.admin_profiles(id),
  deleted_at timestamptz not null default now(),
  reason text not null check (length(trim(reason)) >= 3),
  summary jsonb not null
);

alter table public.booking_deletion_tombstones enable row level security;
revoke all on public.booking_deletion_tombstones from public, anon, authenticated;
grant select on public.booking_deletion_tombstones to authenticated;
grant select, insert on public.booking_deletion_tombstones to service_role;
drop policy if exists "active_admins_read_booking_tombstones"
on public.booking_deletion_tombstones;
create policy "active_admins_read_booking_tombstones"
on public.booking_deletion_tombstones for select to authenticated
using (public.is_active_admin());

create or replace function public.is_active_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = auth.uid() and role in ('admin', 'superadmin') and is_active
  );
$$;

create or replace function public.is_active_superadmin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = auth.uid() and role = 'superadmin' and is_active
  );
$$;
revoke all on function public.is_active_superadmin() from public, anon;
grant execute on function public.is_active_superadmin() to authenticated;

-- Comprueba capacidad bajo el mismo advisory lock usado por las mutaciones.
create or replace function public.assert_booking_capacity(
  target_booking_id uuid, target_tour_slug text, target_date date,
  target_mode text, target_quantity integer
) returns void language plpgsql security definer set search_path = ''
as $$
declare group_date public.tour_dates; occupied integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(target_tour_slug || ':' || target_date::text, 0));
  if exists(select 1 from public.blocked_dates where date=target_date and is_active) then
    raise exception using errcode='P0001', message='BOOKING_DATE_BLOCKED';
  end if;
  if target_mode='private' then
    if exists(select 1 from public.bookings where id<>target_booking_id
      and tour_slug=target_tour_slug and selected_date=target_date
      and archived_at is null and booking_mode='private'
      and (status='approved' or (status='pending_review' and pending_hold_until>now()))) then
      raise exception using errcode='P0001', message='PRIVATE_DATE_UNAVAILABLE';
    end if;
  else
    select * into group_date from public.tour_dates
      where tour_slug=target_tour_slug and date=target_date and is_active for update;
    if group_date.id is null then
      raise exception using errcode='P0001', message='GROUP_DATE_UNAVAILABLE';
    end if;
    select coalesce(sum(quantity),0)::integer into occupied from public.bookings
      where id<>target_booking_id and tour_slug=target_tour_slug
      and selected_date=target_date and archived_at is null and booking_mode<>'private'
      and (status='approved' or (status='pending_review' and pending_hold_until>now()));
    if occupied+target_quantity>group_date.capacity then
      raise exception using errcode='P0001', message='GROUP_CAPACITY_EXCEEDED';
    end if;
  end if;
end $$;

create or replace function public.transition_booking_status(
  target_booking_id uuid, target_status text, action_reason text default null,
  action_notes text default null, action_actor_id uuid default null
) returns public.bookings language plpgsql security definer set search_path = ''
as $$
declare old public.bookings; result public.bookings;
begin
  select * into old from public.bookings where id=target_booking_id for update;
  if old.id is null then raise exception 'BOOKING_NOT_FOUND'; end if;
  if old.archived_at is not null then raise exception 'BOOKING_INACTIVE'; end if;
  if target_status not in ('approved','rejected','cancelled') then raise exception 'INVALID_STATUS'; end if;
  if target_status in ('approved','rejected') and old.status<>'pending_review' then raise exception 'INVALID_STATUS_TRANSITION'; end if;
  if target_status='cancelled' and old.status not in ('pending_review','approved') then raise exception 'INVALID_STATUS_TRANSITION'; end if;
  if target_status in ('rejected','cancelled') and coalesce(trim(action_reason),'')='' then raise exception 'REASON_REQUIRED'; end if;
  if target_status='approved' then
    perform public.assert_booking_capacity(old.id,old.tour_slug,old.selected_date,old.booking_mode,old.quantity);
  end if;
  update public.bookings set status=target_status,pending_hold_until=null,
    approved_at=case when target_status='approved' then now() else approved_at end,
    rejected_at=case when target_status='rejected' then now() else rejected_at end,
    cancelled_at=case when target_status='cancelled' then now() else cancelled_at end,
    rejection_reason=case when target_status='rejected' then action_reason else rejection_reason end,
    cancellation_reason=case when target_status='cancelled' then action_reason else cancellation_reason end,
    admin_notes=coalesce(action_notes,admin_notes)
    where id=old.id returning * into result;
  insert into public.admin_actions(booking_id,action,previous_status,new_status,reason,notes,actor_id,previous_values,new_values)
    values(old.id,target_status,old.status,target_status,action_reason,action_notes,action_actor_id,
      jsonb_build_object('status',old.status),jsonb_build_object('status',target_status));
  return result;
end $$;

create or replace function public.admin_edit_booking(
  target_booking_id uuid, action_actor_id uuid, payload jsonb
) returns public.bookings language plpgsql security definer set search_path = ''
as $$
declare current_booking public.bookings; result public.bookings; new_buyer_id uuid;
  participant jsonb; old_snapshot jsonb; new_snapshot jsonb; participant_count int;
begin
  if not exists(select 1 from public.admin_profiles where id=action_actor_id
    and role in ('admin','superadmin') and is_active) then raise exception 'ADMIN_FORBIDDEN'; end if;
  select * into current_booking from public.bookings where id=target_booking_id for update;
  if current_booking.id is null then raise exception 'BOOKING_NOT_FOUND'; end if;
  participant_count=jsonb_array_length(coalesce(payload->'participants','[]'::jsonb));
  if participant_count<1 or participant_count<>(payload->>'quantity')::int then
    raise exception 'PARTICIPANT_QUANTITY_MISMATCH';
  end if;
  if (payload->>'selected_date')::date<public.costa_rica_today() then raise exception 'BOOKING_DATE_IN_PAST'; end if;
  if current_booking.archived_at is null then
    perform public.assert_booking_capacity(current_booking.id,current_booking.tour_slug,
      (payload->>'selected_date')::date,payload->>'booking_mode',(payload->>'quantity')::int);
  end if;
  old_snapshot=jsonb_build_object('buyer',jsonb_build_object('full_name',(select full_name from public.buyers where id=current_booking.buyer_id),
    'email',(select email from public.buyers where id=current_booking.buyer_id),'phone',(select phone from public.buyers where id=current_booking.buyer_id)),
    'selected_date',current_booking.selected_date,'selected_time',current_booking.selected_time,'quantity',current_booking.quantity,
    'booking_mode',current_booking.booking_mode,'total_amount',current_booking.total_amount,'status',current_booking.status,
    'payment_status',current_booking.payment_status,'admin_notes',current_booking.admin_notes);
  if exists(select 1 from public.bookings where buyer_id=current_booking.buyer_id and id<>current_booking.id) then
    insert into public.buyers(full_name,email,phone) values(payload->'buyer'->>'full_name',payload->'buyer'->>'email',payload->'buyer'->>'phone')
      returning id into new_buyer_id;
  else
    update public.buyers set full_name=payload->'buyer'->>'full_name',email=payload->'buyer'->>'email',
      phone=payload->'buyer'->>'phone' where id=current_booking.buyer_id returning id into new_buyer_id;
  end if;
  update public.bookings set buyer_id=new_buyer_id,selected_date=(payload->>'selected_date')::date,
    selected_time=nullif(payload->>'selected_time','')::time,quantity=(payload->>'quantity')::int,
    booking_mode=payload->>'booking_mode',total_amount=(payload->>'total_amount')::int,
    price_per_person=case when (payload->>'quantity')::int>0 then round((payload->>'total_amount')::numeric/(payload->>'quantity')::int)::int else 0 end,
    admin_notes=coalesce(payload->>'admin_notes','')
    where id=current_booking.id returning * into result;
  delete from public.booking_participants where booking_id=current_booking.id;
  for participant in select * from jsonb_array_elements(payload->'participants') loop
    insert into public.booking_participants(booking_id,position,full_name,phone,has_medical_condition,medical_details,physical_condition)
    values(current_booking.id,(participant->>'position')::int,participant->>'full_name',participant->>'phone',
      coalesce((participant->>'has_medical_condition')::boolean,false),coalesce(participant->>'medical_details',''),
      participant->>'physical_condition');
  end loop;
  new_snapshot=payload;
  insert into public.admin_actions(booking_id,action,previous_status,new_status,actor_id,previous_values,new_values)
    values(current_booking.id,case when current_booking.selected_date<>result.selected_date then 'rescheduled' else 'edited' end,
      current_booking.status,result.status,action_actor_id,old_snapshot,new_snapshot);
  return result;
end $$;

create or replace function public.admin_deactivate_booking(target_booking_id uuid, action_actor_id uuid, action_reason text)
returns public.bookings language plpgsql security definer set search_path = ''
as $$
declare old public.bookings; result public.bookings;
begin
  if length(trim(coalesce(action_reason,'')))<3 then raise exception 'ARCHIVE_REASON_REQUIRED'; end if;
  if not exists(select 1 from public.admin_profiles where id=action_actor_id and role in ('admin','superadmin') and is_active) then raise exception 'ADMIN_FORBIDDEN'; end if;
  select * into old from public.bookings where id=target_booking_id for update;
  if old.id is null then raise exception 'BOOKING_NOT_FOUND'; end if;
  if old.archived_at is not null then raise exception 'BOOKING_ALREADY_INACTIVE'; end if;
  update public.bookings set archived_at=now(),archived_by=action_actor_id,archive_reason=trim(action_reason),
    pending_hold_until=null where id=old.id returning * into result;
  insert into public.admin_actions(booking_id,action,previous_status,new_status,reason,actor_id,previous_values,new_values)
    values(old.id,'inactivated',old.status,old.status,trim(action_reason),action_actor_id,
      jsonb_build_object('archived_at',null),jsonb_build_object('archived_at',result.archived_at));
  return result;
end $$;

create or replace function public.admin_activate_booking(target_booking_id uuid, action_actor_id uuid, action_reason text)
returns public.bookings language plpgsql security definer set search_path = ''
as $$
declare old public.bookings; result public.bookings;
begin
  if length(trim(coalesce(action_reason,'')))<3 then raise exception 'ACTIVATION_REASON_REQUIRED'; end if;
  if not exists(select 1 from public.admin_profiles where id=action_actor_id and role in ('admin','superadmin') and is_active) then raise exception 'ADMIN_FORBIDDEN'; end if;
  select * into old from public.bookings where id=target_booking_id for update;
  if old.id is null then raise exception 'BOOKING_NOT_FOUND'; end if;
  if old.archived_at is null then raise exception 'BOOKING_ALREADY_ACTIVE'; end if;
  perform public.assert_booking_capacity(old.id,old.tour_slug,old.selected_date,old.booking_mode,old.quantity);
  update public.bookings set
    archived_at=null,
    archived_by=null,
    archive_reason=null,
    pending_hold_until=case
      when old.status='pending_review' then now()+interval '24 hours'
      else old.pending_hold_until
    end
  where id=old.id returning * into result;
  insert into public.admin_actions(booking_id,action,previous_status,new_status,reason,actor_id,previous_values,new_values)
    values(old.id,'activated',old.status,old.status,trim(action_reason),action_actor_id,
      jsonb_build_object('archived_at',old.archived_at),jsonb_build_object('archived_at',null));
  return result;
end $$;

create or replace function public.admin_delete_booking(target_booking_id uuid, action_actor_id uuid, confirmation_code text, action_reason text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare old public.bookings; shared_buyer boolean; shared_proof boolean; result jsonb;
begin
  if not exists(select 1 from public.admin_profiles where id=action_actor_id and role='superadmin' and is_active) then raise exception 'SUPERADMIN_REQUIRED'; end if;
  if length(trim(coalesce(action_reason,'')))<3 then raise exception 'DELETE_REASON_REQUIRED'; end if;
  select * into old from public.bookings where id=target_booking_id for update;
  if old.id is null then raise exception 'BOOKING_NOT_FOUND'; end if;
  if old.booking_code<>confirmation_code then raise exception 'BOOKING_CODE_MISMATCH'; end if;
  if old.archived_at is null then raise exception 'BOOKING_MUST_BE_INACTIVE'; end if;
  shared_buyer=exists(select 1 from public.bookings where buyer_id=old.buyer_id and id<>old.id);
  shared_proof=exists(select 1 from public.bookings
    where payment_proof_path=old.payment_proof_path and id<>old.id);
  insert into public.booking_deletion_tombstones(booking_code,deleted_by,reason,summary)
    values(old.booking_code,action_actor_id,trim(action_reason),jsonb_build_object(
      'tour_slug',old.tour_slug,'selected_date',old.selected_date,'quantity',old.quantity,
      'status',old.status,'payment_status',old.payment_status,'created_at',old.created_at));
  result=jsonb_build_object(
    'booking_code',old.booking_code,
    'payment_proof_path',old.payment_proof_path,
    'buyer_shared',shared_buyer,
    'proof_shared',shared_proof
  );
  delete from public.bookings where id=old.id;
  if not shared_buyer then delete from public.buyers where id=old.buyer_id; end if;
  return result;
end $$;

revoke all on function public.assert_booking_capacity(uuid,text,date,text,integer) from public,anon,authenticated;
revoke all on function public.admin_edit_booking(uuid,uuid,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.admin_deactivate_booking(uuid,uuid,text)
  from public,anon,authenticated,service_role;
revoke all on function public.admin_activate_booking(uuid,uuid,text)
  from public,anon,authenticated,service_role;
revoke all on function public.admin_delete_booking(uuid,uuid,text,text)
  from public,anon,authenticated,service_role;
grant execute on function public.admin_edit_booking(uuid,uuid,jsonb) to service_role;
grant execute on function public.admin_deactivate_booking(uuid,uuid,text) to service_role;
grant execute on function public.admin_activate_booking(uuid,uuid,text) to service_role;
grant execute on function public.admin_delete_booking(uuid,uuid,text,text) to service_role;

-- Corrige las barreras de capacidad existentes para ignorar reservas inactivas.
drop index if exists public.bookings_one_approved_private_per_date_idx;
create unique index bookings_one_approved_private_per_date_idx on public.bookings(selected_date)
where booking_mode='private' and status='approved' and archived_at is null;
create index if not exists bookings_active_dashboard_idx
  on public.bookings(archived_at,created_at desc);

create or replace function public.get_private_date_status(requested_date date)
returns table (available boolean, status text, hold_until timestamptz)
language sql stable security definer set search_path = ''
as $$
  with state as (
    select
      exists(select 1 from public.blocked_dates where date=requested_date and is_active) blocked,
      exists(select 1 from public.bookings where selected_date=requested_date and booking_mode='private'
        and archived_at is null and status='approved') approved,
      exists(select 1 from public.bookings where selected_date=requested_date and booking_mode='private'
        and archived_at is null and status='pending_review' and pending_hold_until>now()) held
  )
  select requested_date>=public.costa_rica_today() and not blocked and not approved and not held,
    case when requested_date<public.costa_rica_today() then 'past' when blocked then 'blocked'
      when approved then 'approved' when held then 'in_review' else 'available' end,
    (select max(pending_hold_until) from public.bookings where selected_date=requested_date
      and booking_mode='private' and archived_at is null and status='pending_review' and pending_hold_until>now())
  from state;
$$;

create or replace view public.group_tour_availability with (security_invoker=true) as
select td.id,td.tour_slug,td.tour_name,td.date,td.start_time,td.capacity,td.is_active,
  greatest(td.capacity-coalesce(sum(case when b.archived_at is null and
    (b.status='approved' or (b.status='pending_review' and b.pending_hold_until>now()))
    then b.quantity else 0 end),0),0)::integer available_spots
from public.tour_dates td left join public.bookings b on b.tour_slug=td.tour_slug
  and b.selected_date=td.date and b.booking_mode<>'private'
group by td.id;

commit;
