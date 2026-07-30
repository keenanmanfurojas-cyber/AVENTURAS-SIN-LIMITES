# Fases C y D — Control administrativo de reservas

## Entregables

- Migración: `supabase/migrations/202607290001_admin_booking_control.sql`.
- Rollback: `supabase/rollbacks/202607290001_admin_booking_control.rollback.sql`.
- La migración fue aplicada al proyecto Supabase enlazado después de generar
  un respaldo SQL, validar conteos y ejecutar una prueba sintética controlada.

## Relaciones afectadas

| Relación | Cambio |
| --- | --- |
| `bookings` | `archived_at`, `archived_by`, `archive_reason`; índice activo |
| `admin_profiles` | roles `admin` y `superadmin` |
| `admin_actions` | snapshots `previous_values` y `new_values` |
| `booking_deletion_tombstones` | auditoría permanente mínima del borrado |
| `booking_participants` | reconciliación transaccional con `quantity` |
| `buyers` | copy-on-write cuando el buyer está compartido |
| `group_tour_availability` | excluye inactivas |
| `get_private_date_status` | excluye inactivas |
| `booking-payment-proofs` | limpieza explícita posterior al borrado |

Las relaciones existentes con borrado dependiente revisadas son
`booking_participants`, `admin_actions`, `calendar_syncs` y
`notification_deliveries`. El comprador no se elimina cuando otra reserva lo
referencia.

## Política de eliminación

La eliminación solo acepta una reserva previamente inactiva y un actor
`superadmin`. Exige código exacto, doble confirmación en UI y motivo. La RPC
crea el tombstone antes de borrar la reserva dentro de la misma transacción.
Después del éxito, el servidor elimina el comprobante privado de Storage. Un
fallo de Storage se registra y se devuelve como advertencia para limpieza
manual; el tombstone permite rastrearlo.

El tombstone conserva código, actor, fecha, motivo y un resumen no sensible:
tour, fecha de tour, cantidad, estados y fecha de creación. No conserva datos
del comprador, participantes, información médica ni ruta del comprobante.

## Rollback

El rollback deshabilita y elimina las RPC de
edición/activación/inactivación/eliminación y elimina el índice del panel.
Conserva perfiles, columnas de archivado, snapshots, tombstones y el helper de
capacidad para no destruir datos operativos o de auditoría. No degrada cuentas
`superadmin` ni elimina el rastro de reservas borradas.

## Riesgos y pasos antes de producción

1. Crear o promover al menos un perfil `superadmin` mediante un proceso
   controlado; la migración no autoasciende cuentas.
2. Verificar todas las tablas adicionales que producción pueda tener con FK a
   `bookings`, porque el esquema local solo demuestra las relaciones listadas.
3. Confirmar la política de retención de comprobantes. PostgreSQL y Storage no
   comparten transacción; un fallo posterior de Storage requiere reintento.
4. El esquema actual no tiene una tabla maestra de tours. Para reservas
   grupales, “tour disponible” se demuestra con `tour_dates.is_active`; para
   privadas se comprueban fecha pasada, bloqueo y colisiones. Si producción
   incorpora una tabla maestra, la RPC debe añadir esa comprobación.
5. La reprogramación invalida de hecho el Adventure Pass porque se genera bajo
   demanda y sin caché. Si se almacenan pases en el futuro, será necesario
   versionarlos o eliminarlos al editar.
