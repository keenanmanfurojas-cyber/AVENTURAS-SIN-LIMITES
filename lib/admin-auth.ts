import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "asl_admin_session";
const sessionLifetimeSeconds = 60 * 60 * 8;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function adminAuthIsConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && getSecret().length >= 32);
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createAdminSession() {
  const payload = String(Math.floor(Date.now() / 1000) + sessionLifetimeSeconds);
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(value?: string) {
  if (!value || !adminAuthIsConfigured()) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  const expected = Buffer.from(sign(expires));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function isAdminAuthenticated() {
  return verifyAdminSession((await cookies()).get(adminCookieName)?.value);
}

export function passwordMatches(candidate: string) {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? "");
  const actual = Buffer.from(candidate);
  return (
    adminAuthIsConfigured() &&
    expected.length === actual.length &&
    timingSafeEqual(expected, actual)
  );
}
