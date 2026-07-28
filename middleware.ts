import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

const adminLoginPath = "/admin/login";

function redirectToLogin(request: NextRequest, sessionError = false) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = adminLoginPath;
  loginUrl.search = sessionError ? "?error=session" : "";
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === adminLoginPath ||
    request.nextUrl.pathname.startsWith(`${adminLoginPath}/`)
  ) {
    return NextResponse.next();
  }

  try {
    let response = NextResponse.next({ request });
    const { anonKey, url } = getSupabasePublicEnv();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, options, value }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!user) {
      const sessionMissing = error?.name === "AuthSessionMissingError";
      if (error && !sessionMissing) {
        console.error("Admin session validation failed.", error.message);
      }
      return redirectToLogin(request, Boolean(error && !sessionMissing));
    }
    if (error) {
      console.error("Admin session validation failed.", error.message);
      return redirectToLogin(request, true);
    }

    return response;
  } catch (error) {
    console.error(
      "Admin middleware failed safely.",
      error instanceof Error ? error.message : "Unknown error",
    );
    return redirectToLogin(request, true);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
