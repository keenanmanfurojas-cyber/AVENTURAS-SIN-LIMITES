import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { bookingRepository } from "@/lib/bookings";
import type { BookingStatus } from "@/types/booking";

const allowedStatuses = new Set<BookingStatus>([
  "approved",
  "rejected",
  "cancelled",
]);
type AdminStatus = "approved" | "rejected" | "cancelled";

function isAdminStatus(status?: BookingStatus): status is AdminStatus {
  return Boolean(status && allowedStatuses.has(status) && status !== "pending_review");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { status, reason, adminNotes } = (await request.json()) as {
    adminNotes?: string;
    reason?: string;
    status?: BookingStatus;
  };
  if (!isAdminStatus(status)) {
    return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  }
  if ((status === "rejected" || status === "cancelled") && !reason?.trim()) {
    return NextResponse.json({ error: "El motivo es obligatorio." }, { status: 400 });
  }
  const id = (await params).id;
  const current = await bookingRepository.findById(id);
  if (!current) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }
  const transitionAllowed =
    (status === "approved" && current.status === "pending_review") ||
    (status === "rejected" && current.status === "pending_review") ||
    (status === "cancelled" &&
      (current.status === "pending_review" || current.status === "approved"));
  if (!transitionAllowed) {
    return NextResponse.json(
      { error: "La reserva no permite ese cambio de estado." },
      { status: 409 },
    );
  }
  const record = await bookingRepository.updateStatus(id, {
    adminNotes,
    reason,
    status,
  });
  return record
    ? NextResponse.json({ record })
    : NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
}
