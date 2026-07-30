const publicModeLabels: Record<string, string> = {
  direct: "Sin transporte",
  gam_transport: "Con transporte",
  private: "Tour privado",
  with_transport: "Con transporte",
  without_transport: "Sin transporte",
};

export function getBookingModeLabel(mode: string | null | undefined) {
  if (!mode) return "Modalidad no disponible";
  return publicModeLabels[mode] ?? "Modalidad no disponible";
}
