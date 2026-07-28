import {
  adminStatusClass,
  adminStatusLabels,
  type AdminDisplayStatus,
} from "@/lib/admin-booking-ui";
import { AdminIcon, type AdminIconName } from "@/components/admin/admin-icon";

const statusIcons: Record<AdminDisplayStatus, AdminIconName> = {
  approved: "check",
  cancelled: "close",
  expired: "clock",
  pending_review: "clock",
  rejected: "close",
};

export function AdminStatusBadge({
  status,
}: Readonly<{ status: AdminDisplayStatus }>) {
  return (
    <span
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${adminStatusClass(status)}`}
    >
      <AdminIcon className="size-3.5" name={statusIcons[status]} />
      {adminStatusLabels[status]}
    </span>
  );
}
