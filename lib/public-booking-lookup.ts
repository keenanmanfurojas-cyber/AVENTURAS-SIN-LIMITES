import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { normalizeEmail } from "@/lib/contact-validation";
import { verifyBookingLookupToken } from "@/lib/booking-lookup-token";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicBookingRecord } from "@/types/booking";

const lookupWindowMinutes = 15;
const maximumAttempts = 10;

function safeEqual(first: string, second: string) {
  const left = createHash("sha256").update(first).digest();
  const right = createHash("sha256").update(second).digest();
  return timingSafeEqual(left, right);
}

function requestFingerprint(request: Request) {
  const secret = process.env.BOOKING_LOOKUP_SECRET ?? "";
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const address = forwarded?.trim() || request.headers.get("x-real-ip") || "unknown";
  return createHmac("sha256", secret).update(address).digest("hex");
}

export async function findPublicBooking(
  request: Request,
  code: string,
  email?: string,
  token?: string,
) {
  const supabase = createSupabaseAdminClient();
  const fingerprint = requestFingerprint(request);
  const since = new Date(
    Date.now() - lookupWindowMinutes * 60 * 1000,
  ).toISOString();
  const { count, error: countError } = await supabase
    .from("booking_lookup_attempts")
    .select("id", { count: "exact", head: true })
    .eq("fingerprint_hash", fingerprint)
    .gte("attempted_at", since);
  if (countError) throw new Error("LOOKUP_AUDIT_UNAVAILABLE");
  if ((count ?? 0) >= maximumAttempts) throw new Error("LOOKUP_RATE_LIMITED");

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "booking_code,status,selected_date,tour_name,booking_mode,quantity,total_amount,created_at,payment_status,approved_at,buyer:buyers!inner(email)",
    )
    .eq("booking_code", code)
    .maybeSingle();
  if (error) throw new Error("LOOKUP_FAILED");

  const buyer = data?.buyer as unknown as { email: string } | null;
  const tokenMatches = verifyBookingLookupToken(code, token);
  const emailMatches = Boolean(
    buyer?.email &&
      email &&
      safeEqual(normalizeEmail(email), normalizeEmail(buyer.email)),
  );
  const succeeded = Boolean(data && (tokenMatches || emailMatches));

  await supabase.from("booking_lookup_attempts").insert({
    fingerprint_hash: fingerprint,
    succeeded,
  });

  if (!data || !succeeded) return null;

  const { data: administrativeState, error: administrativeStateError } =
    await supabase
      .from("bookings")
      .select("archived_at")
      .eq("booking_code", code)
      .maybeSingle();
  const migrationIsMissing =
    administrativeStateError?.code === "42703" ||
    administrativeStateError?.code === "PGRST204";
  if (administrativeStateError && !migrationIsMissing) {
    throw new Error("LOOKUP_FAILED");
  }
  if (administrativeState?.archived_at) return null;

  return {
    approvedAt: data.approved_at,
    bookingCode: data.booking_code,
    createdAt: data.created_at,
    mode: data.booking_mode,
    paymentStatus: data.payment_status,
    quantity: data.quantity,
    selectedDate: data.selected_date,
    status:
      data.status === "approved"
        ? "approved"
        : data.status === "pending_review"
          ? "pending_review"
          : "rejected",
    total: data.total_amount,
    tourName: data.tour_name,
  } satisfies PublicBookingRecord;
}
