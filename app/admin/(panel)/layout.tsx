import { AdminShell } from "@/components/admin/admin-shell";
import { requireActiveAdmin } from "@/lib/admin-auth";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { profile, user } = await requireActiveAdmin();
  return (
    <AdminShell
      adminEmail={user.email ?? "Cuenta administrativa"}
      adminName={profile.fullName}
    >
      {children}
    </AdminShell>
  );
}
