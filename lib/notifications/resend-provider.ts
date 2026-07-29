import "server-only";

import type {
  EmailDeliveryResult,
  EmailMessage,
  EmailProvider,
} from "@/lib/notifications/email-provider";

const resendEndpoint = "https://api.resend.com/emails";

export const resendTestSender =
  "Aventuras Sin Límites <onboarding@resend.dev>";

export class EmailProviderError extends Error {
  constructor(readonly code: string) {
    super("El proveedor de correo rechazó la entrega.");
    this.name = "EmailProviderError";
  }
}

export function createResendProvider(apiKey: string): EmailProvider {
  return {
    name: "resend",
    async send(message: EmailMessage): Promise<EmailDeliveryResult> {
      const response = await fetch(resendEndpoint, {
        body: JSON.stringify({
          from: message.from,
          html: message.html,
          subject: message.subject,
          text: message.text,
          to: [message.to],
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": message.idempotencyKey,
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new EmailProviderError(`provider_http_${response.status}`);
      }

      const payload = (await response.json().catch(() => null)) as {
        id?: string;
      } | null;
      return { messageId: payload?.id ?? null };
    },
  };
}
