import { isAdminAuthenticated } from "@/lib/admin-auth";
import { bookingRepository } from "@/lib/bookings";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return new Response("No autorizado", { status: 401 });
  }
  const signedUrl = await bookingRepository.getPaymentProofUrl((await params).id);
  if (signedUrl) return NextResponse.redirect(signedUrl);

  return new Response("No encontrado", { status: 404 });
}
