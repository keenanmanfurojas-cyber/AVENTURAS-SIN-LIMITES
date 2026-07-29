export type EmailMessage = {
  from: string;
  html: string;
  idempotencyKey: string;
  subject: string;
  text: string;
  to: string;
};

export type EmailDeliveryResult = {
  messageId: string | null;
};

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}
