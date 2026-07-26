# Reservas de Ciudad Esmeralda — modo local

Esta implementación es una primera versión funcional de demostración. No está
lista para producción.

## Acceso

1. Copiar las variables de `.env.example` a `.env.local`.
2. Definir `ADMIN_PASSWORD`.
3. Definir `ADMIN_SESSION_SECRET` con un secreto aleatorio de al menos 32
   caracteres.
4. Reiniciar el servidor y abrir `/admin/reservas`.

La ruta redirige a `/admin/login` sin una sesión válida. La sesión se guarda en
una cookie `HttpOnly`, `SameSite=Strict`, firmada y con duración de ocho horas.
Las APIs administrativas y el acceso a comprobantes vuelven a validar esa
sesión en el servidor.

## Persistencia actual

`LocalBookingRepository` guarda las reservas en
`.data/bookings/reservations.json` y los comprobantes, sin extensión ni URL
pública, en `.data/bookings/proofs/`. La carpeta completa está ignorada por Git.
El navegador conserva únicamente el borrador del formulario en `localStorage`;
las reservas enviadas no se administran desde `localStorage`.

El punto de composición `lib/bookings/index.ts` permite sustituir este
repositorio por uno de Supabase sin cambiar el formulario ni el panel.

## Fechas

Las fechas se editan en `availableDates`, dentro de `lib/booking-config.ts`.
Las fechas incluidas actualmente son datos temporales de demostración y están
marcadas con `temporary: true`.

## Antes de producción

Se necesita autenticación administrada, base de datos transaccional,
almacenamiento privado de comprobantes, reglas de acceso/RLS, respaldo,
protección contra abuso y un aviso de privacidad y tratamiento de datos. Los
datos médicos y personales requieren revisión específica de seguridad,
retención, consentimiento y acceso.
