begin;
-- Rollback funcional y no destructivo. Las columnas aditivas y los snapshots
-- se conservan deliberadamente para no perder auditoría ni metadata de
-- reservas que hayan sido inactivadas. Las acciones avanzadas quedan
-- revocadas inmediatamente.
revoke all on function public.admin_delete_booking(uuid,uuid,text,text)
  from public,anon,authenticated,service_role;
revoke all on function public.admin_activate_booking(uuid,uuid,text)
  from public,anon,authenticated,service_role;
revoke all on function public.admin_deactivate_booking(uuid,uuid,text)
  from public,anon,authenticated,service_role;
revoke all on function public.admin_edit_booking(uuid,uuid,jsonb)
  from public,anon,authenticated,service_role;
drop index if exists public.bookings_active_dashboard_idx;
drop function if exists public.admin_delete_booking(uuid,uuid,text,text);
drop function if exists public.admin_activate_booking(uuid,uuid,text);
drop function if exists public.admin_deactivate_booking(uuid,uuid,text);
drop function if exists public.admin_edit_booking(uuid,uuid,jsonb);
-- assert_booking_capacity y las columnas archived_* se conservan como
-- compatibilidad no destructiva: transition_booking_status depende del helper
-- y quitar columnas descartaría metadata operativa.
drop function if exists public.is_active_superadmin();
-- Los tombstones se conservan: borrarlos destruiría el único rastro de una
-- eliminación definitiva ya ejecutada.
-- Los snapshots permanecen porque transition_booking_status los utiliza.
drop index if exists public.bookings_one_approved_private_per_date_idx;
create unique index bookings_one_approved_private_per_date_idx on public.bookings(selected_date)
where booking_mode='private' and status='approved' and archived_at is null;
commit;
