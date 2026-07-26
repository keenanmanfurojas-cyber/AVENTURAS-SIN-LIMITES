import { isAdminAuthenticated } from "@/lib/admin-auth";
import { bookingRepository } from "@/lib/bookings";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return new Response("No autorizado", { status: 401 });
  }
  const proof = await bookingRepository.readPaymentProof((await params).id);
  if (!proof) return new Response("No encontrado", { status: 404 });
  return new Response(new Uint8Array(proof.bytes), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(proof.record.paymentProof.name)}`,
      "Content-Type": proof.record.paymentProof.type,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
