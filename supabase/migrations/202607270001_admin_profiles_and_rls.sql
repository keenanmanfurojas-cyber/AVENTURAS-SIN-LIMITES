begin;

-- Compatibilidad no destructiva si la primera migration ya fue aplicada con
-- el nombre anterior `participants`. ALTER TABLE conserva filas, constraints
-- e índices. La vista mantiene operativas funciones antiguas mientras todos
-- los entornos terminan de aplicar la migration nueva.
do $$
begin
  if to_regclass('public.booking_participants') is null
    and to_regclass('public.participants') is not null then
    alter table public.participants rename to booking_participants;
  end if;
end;
$$;

alter table public.booking_participants enable row level security;

do $$
begin
  if to_regclass('public.participants') is null then
    execute $view$
      create view public.participants
      with (security_invoker = true)
      as select * from public.booking_participants
    $view$;
  end if;
end;
$$;

revoke all on public.participants from public, anon, authenticated;

create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'admin' check (role = 'admin'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger admin_profiles_set_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active
  );
$$;

revoke all on function public.is_active_admin() from public, anon;
grant execute on function public.is_active_admin() to authenticated;

-- La aplicación pública no obtiene permisos directos. La creación de reservas
-- continúa exclusivamente en el servidor validado mediante service role.
grant select on public.admin_profiles to authenticated;
grant select on public.buyers to authenticated;
grant select on public.bookings to authenticated;
grant select on public.booking_participants to authenticated;
grant select, insert, update on public.tour_dates to authenticated;
grant select on public.admin_actions to authenticated;
grant select, insert, update on public.blocked_dates to authenticated;
grant select on public.calendar_syncs to authenticated;

create policy "admin_profiles_read_own_or_admin"
on public.admin_profiles
for select
to authenticated
using (id = auth.uid() or public.is_active_admin());

create policy "active_admins_read_buyers"
on public.buyers
for select
to authenticated
using (public.is_active_admin());

create policy "active_admins_read_bookings"
on public.bookings
for select
to authenticated
using (public.is_active_admin());

create policy "active_admins_read_booking_participants"
on public.booking_participants
for select
to authenticated
using (public.is_active_admin());

create policy "active_admins_read_tour_dates"
on public.tour_dates
for select
to authenticated
using (public.is_active_admin());

create policy "active_admins_create_tour_dates"
on public.tour_dates
for insert
to authenticated
with check (public.is_active_admin());

create policy "active_admins_update_tour_dates"
on public.tour_dates
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create policy "active_admins_read_actions"
on public.admin_actions
for select
to authenticated
using (public.is_active_admin());

create policy "active_admins_read_blocked_dates"
on public.blocked_dates
for select
to authenticated
using (public.is_active_admin());

create policy "active_admins_create_blocked_dates"
on public.blocked_dates
for insert
to authenticated
with check (public.is_active_admin());

create policy "active_admins_update_blocked_dates"
on public.blocked_dates
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create policy "active_admins_read_calendar_syncs"
on public.calendar_syncs
for select
to authenticated
using (public.is_active_admin());

-- El primer perfil se crea manualmente con service role o desde SQL Editor
-- después de crear al usuario en Auth. No existe una política de autoascenso.

commit;
