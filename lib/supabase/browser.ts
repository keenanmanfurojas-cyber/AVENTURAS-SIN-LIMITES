"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  const { anonKey, url } = getSupabasePublicEnv();
  browserClient ??= createBrowserClient(url, anonKey);
  return browserClient;
}
