import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { bookingRepository } from "@/lib/bookings";
import type { BookingStatus } from "@/types/booking";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const params = new URL(request.url).searchParams;
  const records = await bookingRepository.list({
    code: params.get("code") ?? "",
    date: params.get("date") ?? "",
    mode: params.get("mode") ?? "",
    name: params.get("name") ?? "",
    search: params.get("search") ?? "",
    status: (params.get("status") ?? "") as BookingStatus | "",
  });
  return NextResponse.json({ records });
}
