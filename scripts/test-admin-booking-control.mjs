import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const migration = read("supabase/migrations/202607290001_admin_booking_control.sql");
const rollback = read("supabase/rollbacks/202607290001_admin_booking_control.rollback.sql");
const api = read("app/api/admin/reservas/[id]/route.ts");
const ui = read("components/admin/reservation-actions.tsx");
const lookup = read("lib/public-booking-lookup.ts");
const pass = read("app/api/mi-reserva/adventure-pass/route.ts");
const styles = read("app/globals.css");

for (const column of ["archived_at", "archived_by", "archive_reason"]) {
  assert.match(migration, new RegExp(column));
}
for (const rpc of ["admin_edit_booking", "admin_activate_booking", "admin_deactivate_booking", "admin_delete_booking"]) {
  assert.match(migration, new RegExp(`function public\\.${rpc}`));
}
assert.match(migration, /role='superadmin'/);
assert.match(migration, /booking_deletion_tombstones/);
assert.match(migration, /exists\(select 1 from public\.bookings where buyer_id=current_booking\.buyer_id/);
assert.match(migration, /if not shared_buyer then delete from public\.buyers/);
assert.match(migration, /archived_at is null/g);
assert.match(migration, /jsonb_array_length/);
assert.match(migration, /pg_advisory_xact_lock/);
assert.match(rollback, /begin;/);

assert.match(api, /access\.profile\.role !== "superadmin"/);
assert.match(api, /adminClient\.storage[\s\S]*\.remove\(\[proofPath\]\)/);
assert.match(api, /bookingCode: z\.string/);
assert.match(ui, /Escribe \$\{record\.bookingCode\}/);
assert.match(ui, /Confirmo por segunda vez/);
assert.match(ui, /Esta acción eliminará definitivamente/);
assert.match(lookup, /administrativeState\?\.archived_at/);
assert.match(lookup, /migrationIsMissing/);
assert.match(pass, /booking\.archivedAt/);
assert.match(migration, /grant execute on function public\.admin_edit_booking\(uuid,uuid,jsonb\) to service_role/);
assert.doesNotMatch(migration, /grant execute on function public\.admin_edit_booking\(uuid,uuid,jsonb\) to authenticated/);
assert.match(migration, /'proof_shared',shared_proof/);
assert.doesNotMatch(rollback, /update public\.admin_profiles set role='admin'/);
assert.match(styles, /\.admin-ui[\s\S]*var\(--font-manrope\)/);
assert.doesNotMatch(read("components/admin/reservation-actions.tsx"), /Geist|font-serif/i);

console.log("Control administrativo de reservas: contrato local verificado.");
