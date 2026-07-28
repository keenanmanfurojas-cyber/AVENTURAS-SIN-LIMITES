import { NextResponse } from "next/server";

import { getAdminAccess } from "@/lib/admin-auth";
import { listAdminBookings } from "@/lib/admin-bookings";

export async function GET() {
  const access = await getAdminAccess();
  if (!access.user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }
  if (!access.profile) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }
  return NextResponse.json({
    records: await listAdminBookings(access.supabase),
  });
}
