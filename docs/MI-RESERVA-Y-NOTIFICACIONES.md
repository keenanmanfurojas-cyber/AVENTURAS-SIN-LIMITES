# Mi reserva y notificaciones transaccionales

## Comportamiento anterior verificado

- Crear una reserva devolvía el registro completo y lo guardaba únicamente en
  un estado React de `BookingWizard`.
- El borrador, excepto el archivo del comprobante, se guardaba en
  `localStorage`. La confirmación no se guardaba.
- Al recargar, el estado React desaparecía y el formulario restauraba el
  borrador. Después de enviar se eliminaba ese borrador, por lo que se mostraba
  un formulario vacío.
- El código permitía búsquedas administrativas, pero no había una ruta pública
  para recuperar una reserva.
- Aprobar o rechazar llamaba `transition_booking_status`, actualizaba la reserva,
  liberaba la retención, registraba `admin_actions` y no ejecutaba otra acción.
- No existía SDK, llamada HTTP, variable configurada ni log de un proveedor de
  correo. Tampoco existía envío automático por WhatsApp.
- Los enlaces de WhatsApp eran genéricos o de consulta manual.
- El comprobante de pago permanecía privado y solo el administrador obtenía una
  URL firmada de 60 segundos. No existía recibo de confirmación ni PDF.
- El correo se validaba con el control HTML, una expresión regular en cliente y
  Zod en servidor. El teléfono solo exigía entre 7 y 40 caracteres.

## Arquitectura nueva

### Consulta pública

`/mi-reserva` consulta mediante código y correo. La API devuelve exclusivamente
código, estado, fecha, tour, modalidad, cantidad, monto, creación, aprobación y
estado del comprobante. Nunca devuelve UUID, comprador, participantes, datos
médicos ni ruta del comprobante.

Después de crear una reserva se genera un enlace firmado de 30 días con
`BOOKING_LOOKUP_SECRET`. Permite que la confirmación sobreviva recargas. Cuando
el enlace no está disponible o se usa otro dispositivo, se exige código más
correo. El código por sí solo nunca autoriza una consulta.

Los intentos se registran usando una huella HMAC de la dirección de red y se
limitan a 10 por 15 minutos. No se almacena la dirección original.

### Contacto

El comprador selecciona país, Costa Rica `+506` por defecto. El servidor
normaliza el teléfono a E.164 y acepta números internacionales entre 8 y 15
dígitos. Antes de enviar se muestran correo y teléfono finales. El consentimiento
transaccional se registra por reserva.

### Correo

La entrega está desacoplada de la transacción de reserva. Los eventos son:

- `booking_received`;
- `booking_approved`;
- `booking_rejected`.

Cada intento usa una clave idempotente única, destinatario parcialmente oculto,
canal, resultado, código de error seguro y marcas de tiempo. Una falla de correo
se captura y nunca revierte la creación, aprobación o rechazo.

La entrega usa un adaptador desacoplado para Resend. Durante las pruebas el
remitente es `Aventuras Sin Límites <onboarding@resend.dev>`. El interruptor de
envío automático permanece desactivado:

```dotenv
RESEND_API_KEY=
EMAIL_FROM=Aventuras Sin Límites <onboarding@resend.dev>
EMAIL_DELIVERY_ENABLED=false
APP_URL=
```

Mientras `EMAIL_DELIVERY_ENABLED` no sea exactamente `true`, el intento queda
como `skipped/delivery_disabled` y no se contacta al proveedor. La prueba
`npm run test:email-simulation` procesa las tres plantillas con un proveedor en
memoria y no realiza solicitudes de red.

### WhatsApp y recibo

El panel genera mensajes de aprobación o rechazo, pero solo abre WhatsApp o
copia el texto por acción explícita del administrador. No hay envío automático.

Las reservas aprobadas ofrecen un recibo HTML imprimible o guardable como PDF.
Incluye únicamente datos operativos necesarios y un identificador verificable
derivado de información pública de la confirmación.

## Activación pendiente

Antes de desplegar:

1. revisar y aplicar
   `supabase/migrations/202607280001_customer_booking_experience.sql`;
2. configurar `BOOKING_LOOKUP_SECRET` con al menos 32 caracteres en Vercel;
3. mantener `EMAIL_DELIVERY_ENABLED=false` hasta autorizar envíos reales;
4. validar la política de consentimiento y retención con asesoría legal;
5. ejecutar la batería completa en un entorno aislado.

La migración de esta entrega está versionada, pero no fue aplicada a ningún
entorno.
