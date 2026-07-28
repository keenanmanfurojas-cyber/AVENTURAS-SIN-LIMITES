import { BUSINESS_TIMEZONE } from "@/lib/system-config";
import type { BookingMode, BookingRecord, BookingStatus } from "@/types/booking";

export type AdminDisplayStatus = BookingStatus | "expired";

export const adminStatusLabels: Record<AdminDisplayStatus, string> = {
  approved: "Confirmada",
  cancelled: "Cancelada",
  expired: "Vencida",
  pending_review: "Pendiente de revisión",
  rejected: "Rechazada",
};

export function getAdminDisplayStatus(
  record: Pick<BookingRecord, "pendingHoldUntil" | "status">,
  now = Date.now(),
): AdminDisplayStatus {
  return record.status === "pending_review" &&
    record.pendingHoldUntil &&
    Date.parse(record.pendingHoldUntil) <= now
    ? "expired"
    : record.status;
}

export function adminStatusClass(status: AdminDisplayStatus) {
  if (status === "approved")
    return "border-[#b9ff4a]/30 bg-[#b9ff4a]/10 text-[#cbff7a]";
  if (status === "rejected")
    return "border-red-300/30 bg-red-300/10 text-red-200";
  if (status === "cancelled")
    return "border-stone-400/25 bg-stone-400/10 text-stone-300";
  if (status === "expired")
    return "border-amber-300/30 bg-amber-300/10 text-amber-200";
  return "border-sky-300/30 bg-sky-300/10 text-sky-200";
}

export function formatAdminTimestamp(value?: string | null) {
  if (!value) return "—";
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "—";
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: BUSINESS_TIMEZONE,
  }).format(timestamp);
}

export function adminModeLabel(mode: BookingMode) {
  if (mode === "gam_transport") return "Transporte desde la GAM";
  if (mode === "private") return "Tour privado";
  return "Llegada directa";
}
