import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(
  "supabase/migrations/202607260001_booking_platform.sql",
  "utf8",
);
const adminMigration = await readFile(
  "supabase/migrations/202607270001_admin_profiles_and_rls.sql",
  "utf8",
);
const allMigrations = `${migration}\n${adminMigration}`;
const repository = await readFile(
  "lib/bookings/supabase-repository.ts",
  "utf8",
);
const validation = await readFile(
  "lib/bookings/validation.ts",
  "utf8",
);
const adminClient = await readFile("lib/supabase/admin.ts", "utf8");
const adminAuth = await readFile("lib/admin-auth.ts", "utf8");

const checks = [
  ["eight domain tables", (allMigrations.match(/create table public\./g) ?? []).length === 8],
  ["booking participants table", /create table public\.booking_participants/.test(migration)],
  ["admin profiles table", /create table public\.admin_profiles/.test(adminMigration)],
  ["booking code unique", /booking_code text not null unique/.test(migration)],
  ["positive quantity", /quantity > 0/.test(migration)],
  ["non-negative total", /total_amount >= 0/.test(migration)],
  ["valid modes", /'direct', 'gam_transport', 'private'/.test(migration)],
  ["valid statuses", /'pending_review', 'approved', 'rejected', 'cancelled'/.test(migration)],
  ["unique participant position", /unique \(booking_id, position\)/.test(migration)],
  ["unique group tour date", /unique \(tour_slug, date\)/.test(migration)],
  ["private approval partial index", /where booking_mode = 'private' and status = 'approved'/.test(migration)],
  ["Costa Rica civil date", /America\/Costa_Rica/.test(migration)],
  ["blocked dates enforced", /BOOKING_DATE_BLOCKED/.test(migration)],
  ["active private hold enforced", /PRIVATE_DATE_UNAVAILABLE/.test(migration)],
  ["group capacity enforced", /GROUP_CAPACITY_EXCEEDED/.test(migration)],
  ["transactional creation RPC", /create_booking_transaction/.test(migration)],
  ["transactional approval RPC", /transition_booking_status/.test(migration)],
  ["RLS enabled", (allMigrations.match(/enable row level security/g) ?? []).length >= 8],
  ["explicit admin policies", (adminMigration.match(/create policy/g) ?? []).length >= 10],
  ["no public reservation policy", !/to anon/.test(adminMigration)],
  ["private bucket", /'booking-payment-proofs'/.test(migration) && /false,\n  5242880/.test(migration)],
  ["5 MB server limit", /5 \* 1024 \* 1024/.test(validation)],
  ["file signature validation", /bytes\[0\] === 255/.test(validation) && /WEBP/.test(validation)],
  ["signed URL is short", /signedUrlLifetimeSeconds = 60/.test(repository)],
  ["service role server-only", /import \"server-only\"/.test(adminClient)],
  ["JSON persistence not composed", !/LocalBookingRepository/.test(await readFile("lib/bookings/index.ts", "utf8"))],
  ["production admin blocked", /NODE_ENV !== \"production\"/.test(adminAuth)],
  ["proof cleanup on failure", /remove\(\[proofPath\]\)/.test(repository)],
  ["booking code retries", /bookingCodeAttempts = 5/.test(repository)],
];

for (const [name, passed] of checks) {
  assert.equal(passed, true, `Contrato incumplido: ${name}`);
}

console.log(`Contrato de reservas verificado: ${checks.length} controles.`);
