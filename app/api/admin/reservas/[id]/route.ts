import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getAdminAccess,
  requestHasTrustedOrigin,
} from "@/lib/admin-auth";
import { getAdminBooking } from "@/lib/admin-bookings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deliverBookingNotificationSafely } from "@/lib/notifications/delivery";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    adminNotes: z.string().trim().max(2000).optional(),
  }),
  z.object({
    action: z.literal("reject"),
    adminNotes: z.string().trim().max(2000).optional(),
    reason: z.string().trim().min(3).max(1000),
  }),
  z.object({
    action: z.literal("note"),
    note: z.string().trim().min(1).max(2000),
  }),
]);

function transitionError(message: string) {
  if (message.includes("INVALID_STATUS_TRANSITION"))
    return "La reserva ya no permite esta transición.";
  if (message.includes("BOOKING_DATE_BLOCKED"))
    return "La fecha del tour está bloqueada.";
  if (message.includes("GROUP_CAPACITY_EXCEEDED"))
    return "Ya no existe capacidad suficiente para aprobar esta reserva.";
  if (message.includes("GROUP_DATE_UNAVAILABLE"))
    return "La fecha grupal ya no está disponible.";
  if (message.includes("PRIVATE_DATE_ALREADY_APPROVED"))
    return "Ya existe una reserva privada confirmada para esta fecha.";
  return "No fue posible completar la operación.";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requestHasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }

  const access = await getAdminAccess();
  if (!access.user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }
  if (!access.profile) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa los datos de la operación." },
      { status: 400 },
    );
  }

  const id = (await params).id;
  const current = await getAdminBooking(access.supabase, id);
  if (!current) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }

  const adminClient = createSupabaseAdminClient();
  if (parsed.data.action === "note") {
    const { error } = await adminClient.from("admin_actions").insert({
      action: "note_added",
      actor_id: access.user.id,
      booking_id: current.id,
      new_status: current.status,
      notes: parsed.data.note,
      previous_status: current.status,
    });
    if (error) {
      return NextResponse.json(
        { error: "No fue posible guardar la nota." },
        { status: 500 },
      );
    }
  } else {
    if (current.status !== "pending_review") {
      return NextResponse.json(
        { error: "La reserva ya no está pendiente de revisión." },
        { status: 409 },
      );
    }

    const nextStatus =
      parsed.data.action === "approve" ? "approved" : "rejected";
    const { error } = await adminClient.rpc("transition_booking_status", {
      action_actor_id: access.user.id,
      action_notes: parsed.data.adminNotes || null,
      action_reason:
        parsed.data.action === "reject" ? parsed.data.reason : null,
      target_booking_id: current.id,
      target_status: nextStatus,
    });
    if (error) {
      return NextResponse.json(
        { error: transitionError(error.message) },
        { status: 409 },
      );
    }
  }

  const record = await getAdminBooking(access.supabase, id);
  if (
    record &&
    (parsed.data.action === "approve" || parsed.data.action === "reject")
  ) {
    await deliverBookingNotificationSafely(
      record,
      parsed.data.action === "approve"
        ? "booking_approved"
        : "booking_rejected",
    );
  }
  return NextResponse.json({ record });
}
