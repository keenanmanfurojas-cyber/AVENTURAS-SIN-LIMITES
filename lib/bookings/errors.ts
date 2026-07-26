export type BookingErrorCode =
  | "configuration_missing"
  | "date_blocked"
  | "date_in_past"
  | "group_capacity_exceeded"
  | "group_date_unavailable"
  | "invalid_data"
  | "not_found"
  | "private_date_unavailable"
  | "storage_failed"
  | "unexpected";

export class BookingRepositoryError extends Error {
  constructor(
    public readonly code: BookingErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "BookingRepositoryError";
  }
}

export function safeBookingErrorMessage(error: unknown) {
  if (!(error instanceof BookingRepositoryError)) {
    return "No fue posible procesar la solicitud.";
  }

  const messages: Record<BookingErrorCode, string> = {
    configuration_missing:
      "El sistema de reservas no está configurado. Contacta al administrador.",
    date_blocked: "La fecha seleccionada no está disponible.",
    date_in_past: "La fecha seleccionada ya pasó.",
    group_capacity_exceeded: "La fecha no tiene cupos suficientes.",
    group_date_unavailable: "La fecha grupal no está habilitada.",
    invalid_data: "Revisa los datos obligatorios de la solicitud.",
    not_found: "La reserva solicitada no existe.",
    private_date_unavailable:
      "La fecha privada está reservada o tiene una solicitud en revisión.",
    storage_failed: "No fue posible guardar el comprobante.",
    unexpected: "No fue posible procesar la solicitud.",
  };

  return messages[error.code];
}
