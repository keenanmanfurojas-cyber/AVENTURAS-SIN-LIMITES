import type { Metadata } from "next";

import { ReservationsList } from "@/components/admin/reservations-list";
import { requireActiveAdmin } from "@/lib/admin-auth";
import { listAdminBookings } from "@/lib/admin-bookings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reservas administrativas" };

export default async function ReservationsAdminPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ fecha?: string | string[] }>;
}>) {
  const { profile, supabase } = await requireActiveAdmin();
  const { fecha } = await searchParams;
  const records = await listAdminBookings(supabase);
  return (
    <ReservationsList
      initialDate={typeof fecha === "string" ? fecha : ""}
      initialRecords={records}
      role={profile.role}
    />
  );
}
