begin;

create extension if not exists pgcrypto;

create table public.buyers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index buyers_email_idx on public.buyers (lower(email));

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique
    check (booking_code ~ '^ASL-CE-[A-HJ-NP-Z2-9]{5}$'),
  tour_slug text not null,
  tour_name text not null,
  selected_date date not null,
  selected_time time,
  timezone text not null default 'America/Costa_Rica',
  booking_mode text not null
    check (booking_mode in ('direct', 'gam_transport', 'private')),
  quantity integer not null check (quantity > 0),
  buyer_id uuid not null references public.buyers(id),
  price_per_person integer not null check (price_per_person >= 0),
  total_amount integer not null check (total_amount >= 0),
  currency text not null default 'CRC' check (currency = 'CRC'),
  transport_details jsonb not null default '{}'::jsonb,
  food_details jsonb not null default '{}'::jsonb,
  arrival_details jsonb not null default '{}'::jsonb,
  sinpe_account_number text not null,
  sinpe_account_holder text not null,
  payment_proof_path text not null,
  payment_status text not null default 'pending_review'
    check (payment_status in ('pending_review', 'verified', 'rejected')),
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected', 'cancelled')),
  rejection_reason text,
  cancellation_reason text,
  admin_notes text not null default '',
  pending_hold_until timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_selected_date_idx
  on public.bookings (selected_date);
create index bookings_status_idx on public.bookings (status);
create index bookings_buyer_id_idx on public.bookings (buyer_id);

-- Última barrera de concurrencia: solo un tour privado aprobado por fecha.
create unique index bookings_one_approved_private_per_date_idx
  on public.bookings (selected_date)
  where booking_mode = 'private' and status = 'approved';

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  position integer not null check (position > 0),
  full_name text not null,
  phone text not null,
  has_medical_condition boolean not null,
  medical_details text not null default '',
  physical_condition text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id, position)
);

create table public.tour_dates (
  id uuid primary key default gen_random_uuid(),
  tour_slug text not null,
  tour_name text not null,
  date date not null,
  start_time time,
  capacity integer not null check (capacity > 0),
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tour_slug, date)
);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  action text not null,
  previous_status text
    check (previous_status is null or previous_status in
      ('pending_review', 'approved', 'rejected', 'cancelled')),
  new_status text not null
    check (new_status in ('pending_review', 'approved', 'rejected', 'cancelled')),
  reason text,
  notes text,
  actor_id uuid,
  created_at timestamptz not null default now()
);

create index admin_actions_booking_id_idx
  on public.admin_actions (booking_id, created_at);

create table public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  reason text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (date)
);

create table public.calendar_syncs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text not null default 'google',
  external_event_id text,
  sync_status text not null default 'not_requested'
    check (sync_status in ('not_requested', 'pending', 'synced', 'failed')),
  last_error text,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id, provider)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger buyers_set_updated_at before update on public.buyers
for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
for each row execute function public.set_updated_at();
create trigger participants_set_updated_at before update on public.participants
for each row execute function public.set_updated_at();
create trigger tour_dates_set_updated_at before update on public.tour_dates
for each row execute function public.set_updated_at();
create trigger blocked_dates_set_updated_at before update on public.blocked_dates
for each row execute function public.set_updated_at();
create trigger calendar_syncs_set_updated_at before update on public.calendar_syncs
for each row execute function public.set_updated_at();

-- Retorna la fecha civil actual de la operación, independientemente de la zona
-- del proceso que invoque PostgreSQL.
create or replace function public.costa_rica_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Costa_Rica')::date;
$$;

create or replace function public.create_booking_transaction(payload jsonb)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_buyer_id uuid;
  new_booking public.bookings;
  participant jsonb;
  requested_date date := (payload->>'selected_date')::date;
  requested_mode text := payload->>'booking_mode';
  requested_quantity integer := (payload->>'quantity')::integer;
  requested_hold_until timestamptz :=
    nullif(payload->>'pending_hold_until', '')::timestamptz;
  group_date public.tour_dates;
  occupied integer;
begin
  if requested_date < public.costa_rica_today() then
    raise exception using errcode = '22023', message = 'BOOKING_DATE_IN_PAST';
  end if;

  -- Serializa operaciones que compiten por el mismo tour y día.
  perform pg_advisory_xact_lock(
    hashtextextended((payload->>'tour_slug') || ':' || requested_date::text, 0)
  );

  if exists (
    select 1 from public.blocked_dates
    where date = requested_date and is_active
  ) then
    raise exception using errcode = 'P0001', message = 'BOOKING_DATE_BLOCKED';
  end if;

  if requested_mode = 'private' then
    if exists (
      select 1 from public.bookings
      where selected_date = requested_date
        and booking_mode = 'private'
        and (
          status = 'approved'
          or (
            status = 'pending_review'
            and pending_hold_until > now()
          )
        )
    ) then
      raise exception using errcode = 'P0001', message = 'PRIVATE_DATE_UNAVAILABLE';
    end if;
  else
    select * into group_date
    from public.tour_dates
    where tour_slug = payload->>'tour_slug'
      and date = requested_date
      and is_active
    for update;

    if group_date.id is null then
      raise exception using errcode = 'P0001', message = 'GROUP_DATE_UNAVAILABLE';
    end if;

    select coalesce(sum(quantity), 0)::integer into occupied
    from public.bookings
    where tour_slug = payload->>'tour_slug'
      and selected_date = requested_date
      and booking_mode <> 'private'
      and (
        status = 'approved'
        or (
          status = 'pending_review'
          and pending_hold_until > now()
        )
      );

    if occupied + requested_quantity > group_date.capacity then
      raise exception using errcode = 'P0001', message = 'GROUP_CAPACITY_EXCEEDED';
    end if;
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      lower(payload->'buyer'->>'email') || ':' || (payload->'buyer'->>'phone'),
      1
    )
  );

  select id into new_buyer_id
  from public.buyers
  where lower(email) = lower(payload->'buyer'->>'email')
    and phone = payload->'buyer'->>'phone'
  order by created_at asc
  limit 1;

  if new_buyer_id is null then
    insert into public.buyers (full_name, email, phone)
    values (
      payload->'buyer'->>'full_name',
      payload->'buyer'->>'email',
      payload->'buyer'->>'phone'
    )
    returning id into new_buyer_id;
  else
    update public.buyers
    set full_name = payload->'buyer'->>'full_name'
    where id = new_buyer_id;
  end if;

  insert into public.bookings (
    booking_code, tour_slug, tour_name, selected_date, selected_time,
    timezone, booking_mode, quantity, buyer_id, price_per_person,
    total_amount, currency, transport_details, food_details, arrival_details,
    sinpe_account_number, sinpe_account_holder, payment_proof_path,
    payment_status, status, pending_hold_until
  )
  values (
    payload->>'booking_code',
    payload->>'tour_slug',
    payload->>'tour_name',
    requested_date,
    nullif(payload->>'selected_time', '')::time,
    coalesce(nullif(payload->>'timezone', ''), 'America/Costa_Rica'),
    requested_mode,
    requested_quantity,
    new_buyer_id,
    (payload->>'price_per_person')::integer,
    (payload->>'total_amount')::integer,
    'CRC',
    coalesce(payload->'transport_details', '{}'::jsonb),
    coalesce(payload->'food_details', '{}'::jsonb),
    coalesce(payload->'arrival_details', '{}'::jsonb),
    payload->>'sinpe_account_number',
    payload->>'sinpe_account_holder',
    payload->>'payment_proof_path',
    'pending_review',
    'pending_review',
    requested_hold_until
  )
  returning * into new_booking;

  for participant in
    select value from jsonb_array_elements(payload->'participants')
  loop
    insert into public.participants (
      booking_id, position, full_name, phone, has_medical_condition,
      medical_details, physical_condition
    )
    values (
      new_booking.id,
      (participant->>'position')::integer,
      participant->>'full_name',
      participant->>'phone',
      (participant->>'has_medical_condition')::boolean,
      coalesce(participant->>'medical_details', ''),
      participant->>'physical_condition'
    );
  end loop;

  if (
    select count(*) from public.participants
    where booking_id = new_booking.id
  ) <> requested_quantity then
    raise exception using errcode = '22023', message = 'PARTICIPANT_COUNT_MISMATCH';
  end if;

  insert into public.admin_actions (
    booking_id, action, previous_status, new_status, notes
  )
  values (
    new_booking.id, 'submitted', null, 'pending_review',
    'Solicitud creada por el flujo público validado.'
  );

  return new_booking;
end;
$$;

create or replace function public.transition_booking_status(
  target_booking_id uuid,
  target_status text,
  action_reason text default null,
  action_notes text default null,
  action_actor_id uuid default null
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_booking public.bookings;
  updated_booking public.bookings;
  group_date public.tour_dates;
  occupied integer;
begin
  select * into current_booking
  from public.bookings
  where id = target_booking_id
  for update;

  if current_booking.id is null then
    raise exception using errcode = 'P0002', message = 'BOOKING_NOT_FOUND';
  end if;

  if target_status not in ('approved', 'rejected', 'cancelled') then
    raise exception using errcode = '22023', message = 'INVALID_STATUS';
  end if;

  if target_status in ('approved', 'rejected')
    and current_booking.status <> 'pending_review' then
    raise exception using errcode = 'P0001', message = 'INVALID_STATUS_TRANSITION';
  end if;

  if target_status = 'cancelled'
    and current_booking.status not in ('pending_review', 'approved') then
    raise exception using errcode = 'P0001', message = 'INVALID_STATUS_TRANSITION';
  end if;

  if target_status in ('rejected', 'cancelled')
    and coalesce(btrim(action_reason), '') = '' then
    raise exception using errcode = '22023', message = 'REASON_REQUIRED';
  end if;

  if target_status = 'approved' then
    perform pg_advisory_xact_lock(
      hashtextextended(
        current_booking.tour_slug || ':' || current_booking.selected_date::text,
        0
      )
    );

    if exists (
      select 1 from public.blocked_dates
      where date = current_booking.selected_date and is_active
    ) then
      raise exception using errcode = 'P0001', message = 'BOOKING_DATE_BLOCKED';
    end if;

    if current_booking.booking_mode = 'private' then
      if exists (
        select 1 from public.bookings
        where id <> current_booking.id
          and selected_date = current_booking.selected_date
          and booking_mode = 'private'
          and status = 'approved'
      ) then
        raise exception using errcode = '23505',
          message = 'PRIVATE_DATE_ALREADY_APPROVED';
      end if;
    else
      select * into group_date
      from public.tour_dates
      where tour_slug = current_booking.tour_slug
        and date = current_booking.selected_date
        and is_active
      for update;

      if group_date.id is null then
        raise exception using errcode = 'P0001',
          message = 'GROUP_DATE_UNAVAILABLE';
      end if;

      select coalesce(sum(quantity), 0)::integer into occupied
      from public.bookings
      where id <> current_booking.id
        and tour_slug = current_booking.tour_slug
        and selected_date = current_booking.selected_date
        and booking_mode <> 'private'
        and (
          status = 'approved'
          or (
            status = 'pending_review'
            and pending_hold_until > now()
          )
        );

      if occupied + current_booking.quantity > group_date.capacity then
        raise exception using errcode = 'P0001',
          message = 'GROUP_CAPACITY_EXCEEDED';
      end if;
    end if;
  end if;

  update public.bookings
  set
    status = target_status,
    pending_hold_until = null,
    approved_at = case when target_status = 'approved' then now() else approved_at end,
    rejected_at = case when target_status = 'rejected' then now() else rejected_at end,
    cancelled_at = case when target_status = 'cancelled' then now() else cancelled_at end,
    rejection_reason =
      case when target_status = 'rejected' then action_reason else rejection_reason end,
    cancellation_reason =
      case when target_status = 'cancelled' then action_reason else cancellation_reason end,
    admin_notes = coalesce(action_notes, admin_notes)
  where id = current_booking.id
  returning * into updated_booking;

  insert into public.admin_actions (
    booking_id, action, previous_status, new_status, reason, notes, actor_id
  )
  values (
    current_booking.id,
    target_status,
    current_booking.status,
    target_status,
    action_reason,
    action_notes,
    action_actor_id
  );

  return updated_booking;
end;
$$;

create or replace function public.get_private_date_status(requested_date date)
returns table (available boolean, status text, hold_until timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when requested_date < public.costa_rica_today() then false
      when exists (
        select 1 from public.blocked_dates
        where date = requested_date and is_active
      ) then false
      when exists (
        select 1 from public.bookings
        where selected_date = requested_date
          and booking_mode = 'private'
          and status = 'approved'
      ) then false
      when exists (
        select 1 from public.bookings
        where selected_date = requested_date
          and booking_mode = 'private'
          and status = 'pending_review'
          and pending_hold_until > now()
      ) then false
      else true
    end,
    case
      when requested_date < public.costa_rica_today() then 'past'
      when exists (
        select 1 from public.blocked_dates
        where date = requested_date and is_active
      ) then 'blocked'
      when exists (
        select 1 from public.bookings
        where selected_date = requested_date
          and booking_mode = 'private'
          and status = 'approved'
      ) then 'approved'
      when exists (
        select 1 from public.bookings
        where selected_date = requested_date
          and booking_mode = 'private'
          and status = 'pending_review'
          and pending_hold_until > now()
      ) then 'in_review'
      else 'available'
    end,
    (
      select max(pending_hold_until)
      from public.bookings
      where selected_date = requested_date
        and booking_mode = 'private'
        and status = 'pending_review'
        and pending_hold_until > now()
    );
$$;

create or replace view public.group_tour_availability
with (security_invoker = true)
as
select
  td.id,
  td.tour_slug,
  td.tour_name,
  td.date,
  td.start_time,
  td.capacity,
  td.is_active,
  greatest(
    td.capacity - coalesce(sum(
      case
        when b.status = 'approved'
          or (
            b.status = 'pending_review'
            and b.pending_hold_until > now()
          )
        then b.quantity
        else 0
      end
    ), 0),
    0
  )::integer as available_spots
from public.tour_dates td
left join public.bookings b
  on b.tour_slug = td.tour_slug
  and b.selected_date = td.date
  and b.booking_mode <> 'private'
group by td.id;

alter table public.buyers enable row level security;
alter table public.bookings enable row level security;
alter table public.participants enable row level security;
alter table public.tour_dates enable row level security;
alter table public.admin_actions enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.calendar_syncs enable row level security;

-- Sin políticas públicas: el frontend nunca accede directamente a estas
-- tablas. La service role, solo en servidor, realiza las operaciones validadas.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on function public.create_booking_transaction(jsonb)
  from public, anon, authenticated;
revoke all on function public.transition_booking_status(uuid, text, text, text, uuid)
  from public, anon, authenticated;
revoke all on function public.get_private_date_status(date)
  from public, anon, authenticated;
grant execute on function public.create_booking_transaction(jsonb)
  to service_role;
grant execute on function public.transition_booking_status(uuid, text, text, text, uuid)
  to service_role;
grant execute on function public.get_private_date_status(date)
  to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'booking-payment-proofs',
  'booking-payment-proofs',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage tampoco recibe políticas públicas. Solo el backend con service role
-- puede subir, borrar o generar signed URLs cortas.

commit;
