import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { maskEmail } from "@/lib/contact-validation";
import {
  createBookingEmail,
  type BookingNotificationEvent,
} from "@/lib/notifications/templates";
import type { EmailProvider } from "@/lib/notifications/email-provider";
import {
  createResendProvider,
  EmailProviderError,
  resendTestSender,
} from "@/lib/notifications/resend-provider";
import type { BookingRecord } from "@/types/booking";

function safeProviderError(value: unknown) {
  if (value instanceof EmailProviderError) return value.code;
  if (value instanceof Error) return value.name.slice(0, 80);
  return "provider_error";
}

export function automaticEmailDeliveryIsEnabled() {
  return process.env.EMAIL_DELIVERY_ENABLED === "true";
}

export async function sendBookingEmailWithProvider(
  provider: EmailProvider,
  record: BookingRecord,
  event: BookingNotificationEvent,
  idempotencyKey: string,
) {
  const template = createBookingEmail(record, event);
  return provider.send({
    from: process.env.EMAIL_FROM?.trim() || resendTestSender,
    html: template.html,
    idempotencyKey,
    subject: template.subject,
    text: template.text,
    to: record.buyer.email,
  });
}

export async function deliverBookingNotificationSafely(
  record: BookingRecord,
  event: BookingNotificationEvent,
) {
  try {
    const supabase = createSupabaseAdminClient();
    const idempotencyKey = `${record.id}:${event}:email`;
    const { data: attempt, error: insertError } = await supabase
      .from("notification_deliveries")
      .insert({
        booking_id: record.id,
        channel: "email",
        event,
        idempotency_key: idempotencyKey,
        recipient_masked: maskEmail(record.buyer.email),
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError?.code === "23505") return;
    if (insertError || !attempt) {
      console.error("Notification audit unavailable.", insertError?.code);
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (
      !record.transactionalConsent ||
      !automaticEmailDeliveryIsEnabled() ||
      !apiKey ||
      !process.env.APP_URL
    ) {
      await supabase
        .from("notification_deliveries")
        .update({
          error_code: !record.transactionalConsent
            ? "consent_not_present"
            : !automaticEmailDeliveryIsEnabled()
              ? "delivery_disabled"
              : "provider_not_configured",
          finished_at: new Date().toISOString(),
          status: "skipped",
        })
        .eq("id", attempt.id);
      return;
    }

    const provider = createResendProvider(apiKey);
    let errorCode: string | null = null;
    try {
      await sendBookingEmailWithProvider(
        provider,
        record,
        event,
        idempotencyKey,
      );
    } catch (error) {
      errorCode = safeProviderError(error);
    }
    await supabase
      .from("notification_deliveries")
      .update({
        error_code: errorCode,
        finished_at: new Date().toISOString(),
        status: errorCode ? "failed" : "sent",
      })
      .eq("id", attempt.id);
  } catch (error) {
    console.error("Notification delivery failed safely.", safeProviderError(error));
  }
}
