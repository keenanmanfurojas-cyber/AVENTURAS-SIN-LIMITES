import { NextResponse } from "next/server";
import { z } from "zod";

import { requestHasTrustedOrigin } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  if (!requestHasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ingresa un correo y una contraseña válidos." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin" || !profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "Esta cuenta no tiene acceso administrativo activo." },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true });
}
