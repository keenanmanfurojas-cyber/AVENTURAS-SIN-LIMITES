import { NextResponse } from "next/server";

import {
  adminAuthIsConfigured,
  adminCookieName,
  createAdminSession,
  passwordMatches,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  if (!adminAuthIsConfigured()) {
    return NextResponse.json(
      { error: "Configura ADMIN_PASSWORD y ADMIN_SESSION_SECRET en .env.local." },
      { status: 503 },
    );
  }
  if (!password || !passwordMatches(password)) {
    return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, createAdminSession(), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
