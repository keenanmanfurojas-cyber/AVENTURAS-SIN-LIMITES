import type { Metadata } from "next";

import { AdminOverview } from "@/components/admin/admin-overview";
import { requireActiveAdmin } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/admin-bookings";
import { getCostaRicaDateString } from "@/lib/timezone";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resumen administrativo" };

export default async function AdminDashboardPage() {
  const { profile, supabase } = await requireActiveAdmin();
  const dashboard = await getAdminDashboardData(
    supabase,
    getCostaRicaDateString(),
  );

  return (
    <AdminOverview
      adminName={profile.fullName}
      bucketIsPrivate={dashboard.bucketIsPrivate}
      records={dashboard.records}
      upcomingTourDates={dashboard.upcomingTourDates}
    />
  );
}
