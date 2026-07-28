# Panel administrativo de reservas

El panel usa Supabase Auth con correo y contraseña. No existe registro público
ni una contraseña compartida. Toda cuenta debe tener una fila activa en
`public.admin_profiles`.

## Rutas

- `/admin/login`: inicio de sesión.
- `/admin`: indicadores operativos.
- `/admin/reservas`: listado y filtros.
- `/admin/reservas/[id]`: detalle, comprobante y acciones.

Las páginas y APIs administrativas vuelven a validar en servidor tanto la
sesión de Supabase Auth como el perfil activo. El middleware se limita a
refrescar las cookies de sesión para las rutas administrativas.

## Acceso a datos

Las lecturas de `bookings`, `buyers`, `booking_participants`, `admin_actions` y
`tour_dates` utilizan el cliente SSR con el token del usuario. Por tanto, pasan
por las políticas RLS y `public.is_active_admin()`.

Las operaciones privilegiadas quedan exclusivamente en servidor:

- aprobar o rechazar llama `transition_booking_status` con service role después
  de validar la sesión, el perfil activo y la transición solicitada;
- el UUID de Auth se registra como `actor_id`;
- una nota crea una entrada `note_added` en `admin_actions`;
- el comprobante usa una URL firmada de 60 segundos en el bucket privado
  `booking-payment-proofs`.

La service role nunca se incluye en Client Components ni respuestas.

## Crear el primer administrador

1. En Supabase Dashboard, abrir **Authentication → Users**.
2. Crear manualmente el usuario con su correo real y una contraseña segura.
   No habilitar una interfaz pública de registro.
3. Copiar el UUID del usuario recién creado.
4. Abrir **SQL Editor** con acceso de propietario y ejecutar, sustituyendo los
   marcadores por valores reales:

```sql
insert into public.admin_profiles (id, full_name, role, is_active)
values ('<AUTH_USER_UUID>', '<NOMBRE_COMPLETO>', 'admin', true);
```

5. Confirmar que la fila tiene `is_active = true`.
6. Abrir `/admin/login` e iniciar sesión.

No usar la service role en el navegador, no compartir credenciales y no crear
una ruta que inserte perfiles administrativos automáticamente.
