# Auditoría técnica del sistema de reservas

Fecha de auditoría: 2026-07-26

Zona horaria oficial: `America/Costa_Rica`

Alcance: Etapa 1, sin conexión a Supabase, Resend, Google Calendar o Vercel.

## Resumen ejecutivo

El proyecto usa Next.js 15.5.7, React 19.1.1, TypeScript 5.9.2 y App Router.
Ciudad Esmeralda ya tiene un wizard cliente, una API de creación, un repositorio
local, carga privada de comprobantes y un panel administrativo protegido por una
sesión firmada. No hay Server Actions ni `middleware.ts`.

El panel no es un mock visual: lee y modifica registros reales del repositorio
local. Aun así, la implementación completa debe considerarse una demostración.
Los datos viven en el filesystem de una sola instancia y no ofrecen la
durabilidad, concurrencia ni seguridad necesarias para producción.

## Arquitectura actual

- `app/tours/[slug]/page.tsx` genera las páginas de tour con App Router.
- `components/tours/tour-detail-page.tsx` monta `BookingWizard` para Ciudad
  Esmeralda.
- `components/booking/booking-wizard.tsx` mantiene el borrador y el comprobante
  en memoria, valida cada paso y envía `multipart/form-data`.
- `POST /api/reservas` vuelve a validar datos esenciales, calcula precios en el
  servidor, genera identificadores y crea la solicitud.
- `lib/bookings/index.ts` compone una implementación de `BookingRepository`.
- `LocalBookingRepository` guarda JSON y archivos bajo `.data/bookings/`.
- `/admin/login` y `/admin/reservas` usan una cookie `HttpOnly`, firmada con
  HMAC, y las rutas API administrativas vuelven a validar la sesión.

No se detectaron SDK, paquetes ni llamadas existentes a Supabase, Resend o
Google Calendar. Tampoco existe persistencia externa.

## Flujo actual de reserva

1. El visitante selecciona modalidad, cantidad, fecha, comprador,
   participantes, detalles y comprobante.
2. El borrador, sin el archivo, se copia a `localStorage` con la clave
   `asl-booking-draft-ciudad-esmeralda`.
3. El comprobante solo permanece en memoria y en una URL `blob:` de
   previsualización hasta el envío.
4. El navegador envía el borrador y el archivo a `POST /api/reservas`.
5. La API recalcula precio por persona y total, genera `id`, `bookingCode` e ID
   del comprobante y asigna `pending_review`.
6. El repositorio escribe el comprobante en `.data/bookings/proofs/` y los
   metadatos en `.data/bookings/reservations.json`.
7. El panel permite aprobar, rechazar o cancelar y modifica el JSON.

Una solicitud enviada no se pierde al cambiar de navegador mientras siga
existiendo el mismo filesystem del servidor. Sí puede perderse al borrar
`.data`, cambiar de máquina/instancia o desplegar en infraestructura efímera.
El borrador no enviado se pierde al cambiar de navegador, perfil o dispositivo.

## Fechas, código y precios

- Las fechas y cupos son valores manuales en
  `lib/booking-config.ts`; no se derivan de reservas ni de un calendario.
- El estado y `availableSpots` son estáticos. Una aprobación actual no reduce
  cupos ni bloquea automáticamente una fecha privada.
- `generateReservationCode()` usa `crypto.getRandomValues`. Se invoca dentro
  del `POST` al crear la solicitud, nunca durante render SSR.
- La unicidad del código no está garantizada por la persistencia local.
- El total se calcula en `getBookingTotal()` y el precio unitario en
  `getBookingPricePerPerson()`. La API los recalcula y no confía en un total del
  cliente.
- Todos los importes visibles pasan por `formatCrc()`/`formatCurrency()`, un
  helper determinista que no depende del locale automático del navegador.
- Las fechas de tour `YYYY-MM-DD` se muestran con un formateador civil
  determinista. Los instantes administrativos se muestran explícitamente en
  `America/Costa_Rica`.

## Datos de demostración y dependencias

Son datos configurados manualmente: fechas, capacidad, cupos, modalidades,
precios, puntos de salida y textos de estado. No deben interpretarse como
disponibilidad en tiempo real. El repositorio local y la autenticación por una
única contraseña son infraestructura de demostración.

El flujo de reservas depende principalmente de:

- `types/booking.ts`
- `lib/system-config.ts`
- `lib/booking-config.ts`
- `lib/booking-utils.ts`
- `lib/bookings/*`
- `app/api/reservas/route.ts`
- `app/api/admin/**`
- `components/booking/**`
- `components/admin/**`

Las dependencias npm son únicamente Next.js, React y React DOM; no hay clientes
de base de datos, correo o calendario instalados.

## Deuda técnica y riesgos

- El JSON local implementa lectura-modificación-escritura sin transacciones ni
  bloqueo entre procesos. Dos operaciones concurrentes pueden sobrescribirse.
- Aprobar no verifica ni bloquea de forma atómica otro tour privado aprobado en
  la misma fecha.
- No existen constraints para unicidad de `bookingCode` ni integridad
  referencial.
- Los cupos mostrados no se calculan desde reservas aprobadas.
- El archivo puede quedar huérfano si falla la escritura del JSON después de
  guardar el comprobante.
- La API valida MIME y que el archivo no esté vacío, pero aún necesita límite de
  tamaño, inspección de contenido/firma, protección contra abuso y rate limit.
- `JSON.parse` usa casts TypeScript; falta validación de esquema en runtime.
- La autenticación usa una sola contraseña compartida, sin usuarios, roles,
  rotación, auditoría, MFA ni revocación individual.
- Los datos médicos aparecen completos en el panel y requieren acceso mínimo,
  trazabilidad, retención limitada y una base legal/consentimiento revisados.
- No hay notificaciones, sincronización de calendario, reintentos ni
  idempotencia.
- Los estados de fecha, reserva y sincronización no están modelados en una base
  transaccional.

## Configuración central

`lib/system-config.ts` es la fuente no secreta para:

- `BUSINESS_TIMEZONE`
- `ADMIN_NOTIFICATION_EMAIL`
- `WHATSAPP_NUMBER`
- `SINPE_NUMBER`
- `SINPE_ACCOUNT_HOLDER`
- `PRIVATE_TOURS_PER_DAY`

`.env.example` enumera las futuras variables de servicios sin incluir
credenciales reales. `.env.local` está cubierto por `.env*` en `.gitignore`.

## Esquema recomendado para Supabase

Tablas mínimas:

### `bookings`

- `id uuid primary key`
- `booking_code text not null unique`
- `tour_slug text not null`
- `tour_name text not null`
- `tour_date date not null`
- `mode text not null check (...)`
- `status text not null check (status in ('pending_review','approved',
  'rejected','cancelled'))`
- `quantity integer not null check (quantity > 0)`
- `price_per_person_crc integer not null`
- `total_crc integer not null`
- datos de comprador normalizados o columnas explícitas
- detalles de transporte/alimentación validados
- `rejection_reason`, `admin_notes`
- `created_at`, `updated_at`, `approved_at`, `cancelled_at` como
  `timestamptz`
- `calendar_sync_status` y referencias de evento

### `participants`

- `id uuid primary key`
- `booking_id uuid references bookings on delete cascade`
- nombre, correo/teléfono cuando aplique, condición física y campos médicos
- índice por `booking_id`

### `payment_proofs`

- `id uuid primary key`
- `booking_id uuid unique references bookings on delete cascade`
- ruta privada de Storage, nombre, MIME, tamaño, hash y timestamps

### `admin_actions`

- `id uuid primary key`
- `booking_id uuid references bookings`
- usuario administrador, acción, estados anterior/resultante, notas y
  `created_at`

### `tour_dates`

- tour, fecha civil, capacidad, estado operativo y metadatos. La disponibilidad
  debe calcularse con reservas aprobadas, no copiarse desde el navegador.

La regla crítica debe residir en PostgreSQL, por ejemplo mediante un índice
único parcial sobre la fecha para filas `mode = 'private' AND status =
'approved'`. Con `PRIVATE_TOURS_PER_DAY = 1`, esto garantiza como máximo un tour
privado aprobado por fecha. La aprobación debe ejecutarse en una función/RPC o
transacción que bloquee/verifique la fecha, cambie el estado y registre la
acción. Las solicitudes `pending_review` no participan en el índice y no
bloquean definitivamente la fecha. Debe traducirse una violación de unicidad en
un conflicto claro (`409`) para evitar doble aprobación incluso con dos
administradores simultáneos.

## Plan de migración

1. Crear migraciones SQL, enums/checks, índices, RLS y buckets privados.
2. Implementar `SupabaseBookingRepository` detrás de la interfaz existente.
3. Añadir validación runtime compartida y límites de archivos.
4. Migrar fechas/cupos a `tour_dates` y calcular disponibilidad en servidor.
5. Sustituir autenticación compartida por identidades administrativas y roles.
6. Crear una migración controlada de `.data` solo si esos registros deben
   conservarse; no asumir que son producción.
7. Probar concurrencia de aprobaciones privadas antes de habilitar el panel.

Archivos que previsiblemente cambiarán: `lib/bookings/index.ts`, una nueva
implementación del repositorio, rutas de reserva/admin, páginas admin,
configuración de fechas, tipos y validaciones. El wizard visual puede
mantenerse.

## Plan para Resend

Enviar desde el servidor después de persistir la solicitud y después de cada
transición válida. Preparar plantillas para recepción al cliente, aviso al
administrador, aprobación, rechazo y cancelación. Registrar estado, proveedor,
ID, intentos y error; usar claves de idempotencia para evitar duplicados. Un
fallo de correo no debe revertir una reserva ya persistida. `EMAIL_FROM` debe
pertenecer a un dominio verificado y `ADMIN_NOTIFICATION_EMAIL` ser el
destinatario operativo.

## Plan para Google Calendar

Crear el evento únicamente tras aprobar, usando la fecha civil de Costa Rica y
una duración máxima de un día completo. No crear bloqueos definitivos para
solicitudes pendientes. Guardar `event_id`, calendario, estado de sincronización
y último error. Actualizar o eliminar/cancelar el evento al cambiar la reserva.
La base de datos seguirá siendo la fuente de verdad; Calendar es una proyección
con reintentos idempotentes, no el mecanismo que impide dobles reservas.

## Seguridad y privacidad

- Buckets de comprobantes privados, sin URLs públicas permanentes; acceso con
  sesión/rol y URLs firmadas de corta duración.
- RLS con denegación por defecto y Service Role solo en servidor.
- Cifrado en tránsito y en reposo, logs sin datos médicos ni comprobantes.
- Política explícita de consentimiento, propósito, retención y eliminación para
  datos personales, médicos y financieros.
- Separar datos médicos cuando facilite permisos más restrictivos.
- Auditoría inmutable de vistas y cambios administrativos sensibles.
- Validar tipo real, tamaño y contenido del comprobante; considerar análisis de
  malware.
- Definir respaldo, restauración, respuesta a incidentes y rotación de secretos.

## Manejo de zona horaria

Las fechas de tour son fechas civiles (`date`) en Costa Rica, no instantes UTC.
Los timestamps de auditoría usan `timestamptz` y se muestran con
`America/Costa_Rica`. La integración de Calendar debe enviar esa zona
explícitamente. No se debe convertir `YYYY-MM-DD` con `new Date(string)` para
presentación, porque puede desplazar el día según la zona del proceso o cliente.
