import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { normalizeEmail } from "@/lib/contact-validation";

const tokenLifetimeSeconds = 60 * 60 * 24 * 30;

function getLookupSecret() {
  const secret = process.env.BOOKING_LOOKUP_SECRET ?? "";
  return secret.length >= 32 ? secret : null;
}

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createBookingLookupToken(code: string, email: string) {
  const secret = getLookupSecret();
  if (!secret) return null;
  const expires = Math.floor(Date.now() / 1000) + tokenLifetimeSeconds;
  const emailHash = createHmac("sha256", secret)
    .update(normalizeEmail(email))
    .digest("base64url")
    .slice(0, 24);
  const payload = `${code.toUpperCase()}.${emailHash}.${expires}`;
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyBookingLookupToken(code: string, token?: string) {
  const secret = getLookupSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [tokenCode, emailHash, expires, providedSignature] = parts;
  if (
    tokenCode !== code.toUpperCase() ||
    !emailHash ||
    !expires ||
    Number(expires) < Date.now() / 1000 ||
    !providedSignature
  ) {
    return false;
  }
  const payload = `${tokenCode}.${emailHash}.${expires}`;
  const expected = Buffer.from(signature(payload, secret));
  const provided = Buffer.from(providedSignature);
  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}

export function lookupProtectionIsConfigured() {
  return Boolean(getLookupSecret());
}
