# Configuración de Supabase para reservas

Esta etapa quedó preparada localmente, pero no enlazada a un proyecto remoto.
No hay referencias de proyecto ni credenciales versionadas.

## Requisitos

- Node.js y las dependencias instaladas con `npm install`.
- Un proyecto Supabase propiedad de Aventuras Sin Límites.
- Supabase CLI. Puede ejecutarse sin instalación global mediante `npx supabase`.
- Acceso autorizado para obtener URL, anon key y service role key.

## Crear o enlazar el proyecto

Si todavía no existe, el propietario debe crear el proyecto desde Supabase y
guardar las credenciales en su gestor seguro. Desde la raíz del repositorio:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF_REAL>
npx supabase db push
```

No se debe inventar el `project-ref`. `supabase/config.toml` contiene únicamente
configuración local, no identifica un proyecto remoto.

Antes de `db push`, revisar especialmente
`202607260002_ciudad_esmeralda_dates.sql`: contiene las fechas que ya mostraba
el flujo aprobado. Las fechas agotadas quedaron inactivas y no se crearon
reservas ficticias para representar cupos.

## Variables requeridas

Copiar `.env.example` a `.env.local` y completar localmente:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PRIVATE_BOOKING_HOLD_HOURS=24
```

La anon key puede llegar al navegador; la service role no. La service role solo
se lee desde módulos `server-only` y nunca debe usar el prefijo `NEXT_PUBLIC_`.
No pegar valores reales en documentación, commits, incidencias ni mensajes.

## Migrations y modelo

Las migrations versionadas están en `supabase/migrations/`:

1. `202607260001_booking_platform.sql`: tablas, constraints, funciones
   transaccionales, RLS, vista de cupos y bucket.
2. `202607260002_ciudad_esmeralda_dates.sql`: fechas ya publicadas por el flujo.
3. `202607270001_admin_profiles_and_rls.sql`: perfiles administrativos y
   políticas explícitas para usuarios autenticados con rol admin. También
   renombra de forma compatible una tabla `participants` previamente aplicada,
   conservando sus filas.

Tablas:

- `bookings`
- `booking_participants`
- `tour_dates`
- `admin_profiles`
- `buyers`
- `admin_actions`
- `blocked_dates`
- `calendar_syncs`

`participants` queda únicamente como vista de compatibilidad sin permisos
públicos; la tabla canónica es `booking_participants`.

El bucket `booking-payment-proofs` se crea privado, con límite de 5 MiB y MIME
PNG/JPEG/WEBP. No existen políticas públicas de Storage.

## Ejecutar localmente

Con Docker disponible:

```bash
npx supabase start
npx supabase db reset
npm run dev
```

`db reset` aplica migrations a la base local. Supabase es la única persistencia
activa. Si faltan variables, las APIs devuelven un error controlado tanto en
desarrollo como en producción; no se crean reservas JSON de demostración.

## Tipos generados

No se generaron tipos remotos porque no había proyecto enlazado. Después de
enlazar y aplicar las migrations:

```bash
npx supabase gen types typescript --linked > types/supabase.generated.ts
```

El archivo generado debe revisarse y versionarse. Los tipos de dominio en
`types/booking.ts` deben permanecer separados cuando expresen necesidades de la
interfaz que no sean filas SQL directas.

## Comprobar RLS

Todas las tablas sensibles tienen RLS activado. `anon` no tiene permisos
directos. La creación pública ocurre mediante `POST /api/reservas`, validado en
servidor, que usa service role.

Los usuarios `authenticated` solo reciben permisos limitados y cada operación
queda condicionada por `is_active_admin()`, que exige una fila activa con
`role = 'admin'` en `admin_profiles`. No existe una política para que una cuenta
se otorgue privilegios por sí misma.

Comprobaciones recomendadas desde un cliente configurado solo con anon key:

- `select` de `bookings`, `buyers`, `booking_participants` y `admin_actions`
  con anon key debe fallar
  o devolver cero filas.
- `insert` y `update` directos deben ser rechazados.
- No debe poder listarse `storage.objects` del bucket.
- La URL pública convencional del archivo no debe funcionar.

La service role omite RLS y por eso nunca puede llegar a un Client Component.
El panel usa Supabase Auth y exige una fila activa en `admin_profiles`. Sus
lecturas se hacen con la sesión del usuario y pasan por RLS.

## Crear el primer perfil administrativo

1. Crear al usuario desde Supabase Auth.
2. Copiar su UUID desde el panel de Auth.
3. En SQL Editor, con acceso de propietario, ejecutar sustituyendo únicamente
   el UUID y el nombre reales:

```sql
insert into public.admin_profiles (id, full_name, role, is_active)
values ('<AUTH_USER_UUID>', '<NOMBRE>', 'admin', true);
```

Este bootstrap es manual para evitar cualquier ruta de autoascenso. No enviar
el UUID ni credenciales por chat y no insertar perfiles desde el navegador.

## Comprobantes y signed URLs

El servidor:

1. valida MIME y máximo 5 MB;
2. genera una ruta con UUID sin usar el nombre aportado;
3. sube al bucket privado;
4. guarda únicamente la ruta;
5. elimina el archivo si falla la transacción de base de datos.

La ruta administrativa genera una signed URL de 60 segundos después de validar
la sesión. No se almacena ni entrega una URL pública permanente.

Para verificar privacidad:

1. crear una solicitud válida;
2. confirmar que `bookings.payment_proof_path` solo contiene una ruta;
3. abrir el endpoint administrativo autenticado y comprobar la redirección
   temporal;
4. cerrar sesión y confirmar respuesta `401`;
5. intentar construir una URL pública y confirmar que Storage la rechaza.

## Disponibilidad y concurrencia

`create_booking_transaction` y `transition_booking_status` usan advisory locks
por tour/fecha y vuelven a comprobar disponibilidad dentro de la transacción.

- Privados: solicitudes pendientes con retención vigente muestran “En
  revisión”; las vencidas dejan de bloquear. Rechazar o cancelar elimina la
  retención. Aprobar queda protegido también por un índice único parcial global
  sobre `selected_date` para `booking_mode = 'private'`.
- Grupales: `available_spots` se deriva de capacidad menos reservas aprobadas y
  pendientes con retención vigente. No se almacena un contador duplicado.
- `blocked_dates` se respeta al crear y aprobar.
- Las fechas civiles se comparan con el día actual de
  `America/Costa_Rica`.

## Pruebas SQL

`supabase/tests/booking_platform.sql` contiene pruebas transaccionales que no
persisten datos. Con Supabase local iniciado:

```bash
npx supabase test db
```

Las pruebas remotas y de concurrencia deben ejecutarse primero contra un
proyecto de desarrollo, nunca directamente contra producción.

## Revisar reservas y panel

En desarrollo:

1. configurar las variables de Supabase;
2. ejecutar `npm run dev`;
3. abrir `/admin/login`;
4. acceder a `/admin/reservas`.

No existe registro público de administradores. La sesión se mantiene con
cookies de Supabase Auth y se valida junto con `admin_profiles` en todas las
rutas privadas.

El panel lee comprador, participantes, estado, historial, modalidad, fecha,
total y comprobante firmado. Aprobar, rechazar y cancelar llaman funciones
server-side transaccionales.

## Datos demo

`.data/bookings/` contiene datos locales históricos de demostración, sigue
ignorado por Git y ya no participa en la persistencia activa. No se migra
automáticamente.

El script opcional se niega a ejecutarse por defecto:

```bash
npm run migrate:demo
```

Solo después de revisar y autorizar expresamente esos registros:

```bash
MIGRATE_DEMO_DATA=true npm run migrate:demo
```

El script requiere las variables Supabase, usa rutas nuevas privadas y limpia
el comprobante si falla la transacción. Para limpiar los datos demo locales,
detener el servidor y eliminar manualmente `.data/bookings` únicamente después
de confirmar que no deben conservarse.

## Recuperación de errores

- Si `db push` falla, no editar migrations ya aplicadas: crear una migration
  correctiva versionada.
- Si la subida falla, la reserva no se crea.
- Si la transacción falla después de la subida, el repositorio intenta eliminar
  el objeto.
- Revisar errores en logs privados del servidor sin registrar datos médicos,
  comprobantes o credenciales.
- Comprobar estado de migrations con `npx supabase migration list`.
- Mantener respaldos y probar restauración antes de producción.

## Pendiente para etapas posteriores

- Protección adicional contra abuso y rate limiting.
- Revisión legal de consentimiento, privacidad y retención.
- Generación de tipos tras enlazar el proyecto.
- Envío de notificaciones y sincronización de calendario.

Resend, Google Calendar, Canva y Vercel no forman parte de esta configuración.
