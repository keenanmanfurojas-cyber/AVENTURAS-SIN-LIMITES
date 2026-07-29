begin;

alter table public.bookings
  add column transactional_message_consent boolean not null default false;

create or replace function public.sync_booking_payment_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'approved' then
    new.payment_status := 'verified';
  elsif new.status = 'rejected' then
    new.payment_status := 'rejected';
  end if;
  return new;
end;
$$;

create trigger bookings_sync_payment_status
before update of status on public.bookings
for each row
when (old.status is distinct from new.status)
execute function public.sync_booking_payment_status();

revoke all on function public.sync_booking_payment_status()
  from public, anon, authenticated;

update public.bookings
set payment_status = case
  when status = 'approved' then 'verified'
  when status = 'rejected' then 'rejected'
  else payment_status
end
where status in ('approved', 'rejected');

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event text not null check (
    event in ('booking_received', 'booking_approved', 'booking_rejected')
  ),
  channel text not null check (channel in ('email', 'whatsapp')),
  recipient_masked text not null,
  status text not null check (
    status in ('pending', 'sent', 'failed', 'skipped')
  ),
  error_code text,
  idempotency_key text not null unique,
  attempted_at timestamptz not null default now(),
  finished_at timestamptz
);

create index notification_deliveries_booking_idx
  on public.notification_deliveries (booking_id, attempted_at desc);

create table public.booking_lookup_attempts (
  id bigint generated always as identity primary key,
  fingerprint_hash text not null,
  succeeded boolean not null default false,
  attempted_at timestamptz not null default now()
);

create index booking_lookup_attempts_window_idx
  on public.booking_lookup_attempts (fingerprint_hash, attempted_at desc);

alter table public.notification_deliveries enable row level security;
alter table public.booking_lookup_attempts enable row level security;

revoke all on public.notification_deliveries from public, anon, authenticated;
revoke all on public.booking_lookup_attempts from public, anon, authenticated;

create policy "active_admins_read_notification_deliveries"
on public.notification_deliveries
for select
to authenticated
using (public.is_active_admin());

grant select on public.notification_deliveries to authenticated;
grant select, insert, update on public.notification_deliveries to service_role;
grant select, insert on public.booking_lookup_attempts to service_role;
grant usage, select on sequence public.booking_lookup_attempts_id_seq
  to service_role;

create or replace function public.create_booking_transaction_v2(payload jsonb)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_booking public.bookings;
begin
  created_booking := public.create_booking_transaction(payload);

  update public.bookings
  set transactional_message_consent =
    coalesce((payload->>'transactional_message_consent')::boolean, false)
  where id = created_booking.id
  returning * into created_booking;

  return created_booking;
end;
$$;

revoke all on function public.create_booking_transaction_v2(jsonb)
  from public, anon, authenticated;
grant execute on function public.create_booking_transaction_v2(jsonb)
  to service_role;

commit;
