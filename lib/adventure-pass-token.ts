import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import type { AdventurePassData } from "@/components/adventure-pass/adventure-pass";

const tokenLifetimeMs = 5 * 60 * 1000;

type AdventurePassTokenPayload = {
  data: AdventurePassData;
  expiresAt: number;
};

function encryptionKey() {
  const secret = process.env.BOOKING_LOOKUP_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADVENTURE_PASS_SECRET_NOT_CONFIGURED");
  }
  return createHash("sha256").update(secret).digest();
}

export function createAdventurePassRenderToken(data: AdventurePassData) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const plaintext = Buffer.from(
    JSON.stringify({
      data,
      expiresAt: Date.now() + tokenLifetimeMs,
    } satisfies AdventurePassTokenPayload),
  );
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function readAdventurePassRenderToken(token: string) {
  try {
    const packed = Buffer.from(token, "base64url");
    if (packed.length < 29) return null;
    const iv = packed.subarray(0, 12);
    const tag = packed.subarray(12, 28);
    const encrypted = packed.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const payload = JSON.parse(
      Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
        "utf8",
      ),
    ) as AdventurePassTokenPayload;
    if (!payload.data || payload.expiresAt < Date.now()) return null;
    return payload.data;
  } catch {
    return null;
  }
}
