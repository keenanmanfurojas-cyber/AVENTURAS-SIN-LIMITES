import { NextResponse } from "next/server";

import { getAdminAccess } from "@/lib/admin-auth";
import { getAdminBooking } from "@/lib/admin-bookings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getAdminAccess();
  if (!access.user) return new Response("Sesión no válida.", { status: 401 });
  if (!access.profile) return new Response("Acceso denegado.", { status: 403 });

  const record = await getAdminBooking(access.supabase, (await params).id);
  if (!record?.paymentProof.id) {
    return new Response("Comprobante no encontrado.", { status: 404 });
  }

  const { data, error } = await createSupabaseAdminClient()
    .storage.from("booking-payment-proofs")
    .createSignedUrl(record.paymentProof.id, 60);

  if (error || !data.signedUrl) {
    return new Response("No fue posible abrir el comprobante.", { status: 404 });
  }
  return NextResponse.redirect(data.signedUrl);
}
