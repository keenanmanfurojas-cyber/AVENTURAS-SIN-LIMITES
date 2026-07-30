export const ADMIN_METRICS_TIMEZONE = "America/Costa_Rica";

type MetricsBooking = {
  approvedAt?: string | null;
  archivedAt?: string | null;
  paymentStatus?: string;
  quantity: number;
  status: string;
  total: number;
};

export type AdminMetrics = {
  averageTicket: number;
  cancelledBookings: number;
  confirmedBookings: number;
  confirmedParticipants: number;
  monthRevenue: number;
  pendingBookings: number;
  todayRevenue: number;
  yearRevenue: number;
};

type CostaRicaDateParts = {
  day: number;
  month: number;
  year: number;
};

const datePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "numeric",
  month: "numeric",
  timeZone: ADMIN_METRICS_TIMEZONE,
  year: "numeric",
});

function costaRicaDateParts(value: Date): CostaRicaDateParts | null {
  if (Number.isNaN(value.getTime())) return null;
  const parts = datePartsFormatter.formatToParts(value);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const year = read("year");
  const month = read("month");
  const day = read("day");
  return year && month && day ? { day, month, year } : null;
}

function isConfirmedRevenue(record: MetricsBooking) {
  return (
    record.status === "approved" &&
    record.paymentStatus === "verified" &&
    !record.archivedAt &&
    Boolean(record.approvedAt)
  );
}

function safeAmount(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function safeQuantity(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.trunc(value) : 0;
}

export function calculateAdminMetrics(
  records: readonly MetricsBooking[],
  now: Date = new Date(),
): AdminMetrics {
  const currentDate = costaRicaDateParts(now);
  const confirmed = records.filter(isConfirmedRevenue);
  let todayRevenue = 0;
  let monthRevenue = 0;
  let yearRevenue = 0;
  let totalConfirmedRevenue = 0;

  for (const record of confirmed) {
    const amount = safeAmount(record.total);
    const approvedDate = costaRicaDateParts(new Date(record.approvedAt!));
    totalConfirmedRevenue += amount;
    if (!currentDate || !approvedDate) continue;
    if (approvedDate.year === currentDate.year) {
      yearRevenue += amount;
      if (approvedDate.month === currentDate.month) {
        monthRevenue += amount;
        if (approvedDate.day === currentDate.day) todayRevenue += amount;
      }
    }
  }

  return {
    averageTicket:
      confirmed.length > 0
        ? Math.round(totalConfirmedRevenue / confirmed.length)
        : 0,
    cancelledBookings: records.filter(
      (record) => record.status === "cancelled" && !record.archivedAt,
    ).length,
    confirmedBookings: confirmed.length,
    confirmedParticipants: confirmed.reduce(
      (total, record) => total + safeQuantity(record.quantity),
      0,
    ),
    monthRevenue,
    pendingBookings: records.filter(
      (record) => record.status === "pending_review" && !record.archivedAt,
    ).length,
    todayRevenue,
    yearRevenue,
  };
}
