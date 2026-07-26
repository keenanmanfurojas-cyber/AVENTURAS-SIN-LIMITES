import "server-only";

import { createClient } from "@supabase/supabase-js";

const serviceRoleVariable = "SUPABASE_SERVICE_ROLE_KEY";

export function hasSupabaseAdminEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env[serviceRoleVariable],
  );
}

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env[serviceRoleVariable];

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase administrativo no está configurado en el servidor.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
