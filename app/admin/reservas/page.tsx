import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReservationsDashboard } from "@/components/admin/reservations-dashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { bookingRepository } from "@/lib/bookings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel de reservas" };

export default async function ReservationsAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const records = await bookingRepository.list();
  return <ReservationsDashboard initialRecords={records} />;
}
