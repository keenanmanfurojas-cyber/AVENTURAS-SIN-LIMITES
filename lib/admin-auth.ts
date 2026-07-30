import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminProfile = {
  fullName: string;
  id: string;
  isActive: boolean;
  role: "admin" | "superadmin";
};

export type AdminAccess = {
  profile: AdminProfile | null;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: User | null;
};

export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { profile: null, supabase, user: null };

  const { data } = await supabase
    .from("admin_profiles")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  const profile =
    (data?.role === "admin" || data?.role === "superadmin") && data.is_active
      ? {
          fullName: data.full_name,
          id: data.id,
          isActive: true,
          role: data.role,
        }
      : null;

  return { profile, supabase, user };
}

export async function requireActiveAdmin() {
  const access = await getAdminAccess();
  if (!access.user) redirect("/admin/login");
  if (!access.profile) redirect("/admin/login?denied=1");
  return {
    profile: access.profile,
    supabase: access.supabase,
    user: access.user,
  };
}

export async function isAdminAuthenticated() {
  const { profile, user } = await getAdminAccess();
  return Boolean(user && profile);
}

export function requestHasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
