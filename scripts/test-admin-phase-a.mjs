import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

import {
  ADMIN_METRICS_TIMEZONE,
  calculateAdminMetrics,
} from "../lib/admin-metrics.ts";
import { getBookingModeLabel } from "../lib/booking-mode-label.ts";
import { formatCrc } from "../lib/currency.ts";

const now = new Date("2026-07-29T18:00:00.000Z");
const records = [
  {
    approvedAt: "2026-07-29T06:30:00.000Z",
    paymentStatus: "verified",
    quantity: 2,
    status: "approved",
    total: 42000,
  },
  {
    approvedAt: "2026-07-01T15:00:00.000Z",
    paymentStatus: "verified",
    quantity: 3,
    status: "approved",
    total: 70000,
  },
  {
    approvedAt: "2026-01-04T15:00:00.000Z",
    paymentStatus: "verified",
    quantity: 1,
    status: "approved",
    total: 35000,
  },
  {
    approvedAt: "2025-12-20T15:00:00.000Z",
    paymentStatus: "verified",
    quantity: 4,
    status: "approved",
    total: 90000,
  },
  {
    approvedAt: null,
    paymentStatus: "pending_review",
    quantity: 2,
    status: "pending_review",
    total: 50000,
  },
  {
    approvedAt: "2026-07-29T12:00:00.000Z",
    paymentStatus: "rejected",
    quantity: 1,
    status: "rejected",
    total: 30000,
  },
  {
    approvedAt: "2026-07-29T12:00:00.000Z",
    paymentStatus: "verified",
    quantity: 1,
    status: "cancelled",
    total: 30000,
  },
  {
    approvedAt: "2026-07-29T12:00:00.000Z",
    archivedAt: "2026-07-30T12:00:00.000Z",
    paymentStatus: "verified",
    quantity: 5,
    status: "approved",
    total: 125000,
  },
  {
    approvedAt: "2026-07-29T12:00:00.000Z",
    paymentStatus: "pending_review",
    quantity: 8,
    status: "approved",
    total: 180000,
  },
];

const metrics = calculateAdminMetrics(records, now);
assert.equal(ADMIN_METRICS_TIMEZONE, "America/Costa_Rica");
assert.deepEqual(metrics, {
  averageTicket: 59250,
  cancelledBookings: 1,
  confirmedBookings: 4,
  confirmedParticipants: 10,
  monthRevenue: 112000,
  pendingBookings: 1,
  todayRevenue: 42000,
  yearRevenue: 147000,
});

assert.equal(formatCrc(42000), "₡42.000");
assert.equal(formatCrc(0), "₡0");
assert.equal(getBookingModeLabel("gam_transport"), "Con transporte");
assert.equal(getBookingModeLabel("direct"), "Sin transporte");
assert.equal(getBookingModeLabel("without_transport"), "Sin transporte");
assert.equal(getBookingModeLabel("private"), "Tour privado");
assert.equal(getBookingModeLabel("internal_unknown"), "Modalidad no disponible");

const trackedFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  {
  encoding: "utf8",
  },
).trim().split("\n");
const forbiddenTypography =
  /\b(?:Instrument Serif|Cormorant(?: Garamond)?|Georgia|Times(?: New Roman)?|font-serif)\b|(?<!sans-)\bserif\b/i;
const sourceExtensions = /\.(?:css|html|js|jsx|mjs|ts|tsx)$/;
const violations = trackedFiles
  .filter((file) => sourceExtensions.test(file))
  .filter((file) =>
    file.startsWith("app/admin/") ||
    file.startsWith("components/admin/") ||
    file.startsWith("lib/admin-"),
  )
  .filter((file) => forbiddenTypography.test(readFileSync(file, "utf8")));
assert.deepEqual(
  violations,
  [],
  `Se encontraron referencias tipográficas prohibidas: ${violations.join(", ")}`,
);

console.log("Fase A admin: métricas, CRC, modalidades y tipografía verificadas.");
