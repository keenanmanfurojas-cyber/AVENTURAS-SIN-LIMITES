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
const customerMigration = await readFile(
  "supabase/migrations/202607280001_customer_booking_experience.sql",
  "utf8",
);
const allMigrations = `${migration}\n${adminMigration}\n${customerMigration}`;
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
const adminLogin = await readFile("app/api/admin/login/route.ts", "utf8");
const adminAction = await readFile(
  "app/api/admin/reservas/[id]/route.ts",
  "utf8",
);
const proofRoute = await readFile(
  "app/api/admin/reservas/[id]/comprobante/route.ts",
  "utf8",
);
const publicLookup = await readFile("app/api/mi-reserva/route.ts", "utf8");
const notificationDelivery = await readFile(
  "lib/notifications/delivery.ts",
  "utf8",
);
const proofConstraints = await readFile(
  "lib/payment-proof-constraints.ts",
  "utf8",
);

const checks = [
  ["ten domain tables", (allMigrations.match(/create table public\./g) ?? []).length === 10],
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
  ["1.5 MB server proof limit", /1\.5 \* 1024 \* 1024/.test(proofConstraints)],
  ["3 MB original proof limit", /3 \* 1024 \* 1024/.test(proofConstraints)],
  ["file signature validation", /bytes\[0\] === 255/.test(validation) && /WEBP/.test(validation)],
  ["signed URL is short", /signedUrlLifetimeSeconds = 60/.test(repository)],
  ["service role server-only", /import \"server-only\"/.test(adminClient)],
  ["JSON persistence not composed", !/LocalBookingRepository/.test(await readFile("lib/bookings/index.ts", "utf8"))],
  ["Supabase Auth session validation", /auth\.getUser\(\)/.test(adminAuth)],
  ["active admin profile validation", /admin_profiles/.test(adminAuth) && /is_active/.test(adminAuth)],
  ["password login through Supabase Auth", /signInWithPassword/.test(adminLogin)],
  ["no public admin signup", !/signUp/.test(adminLogin)],
  ["admin actor recorded", /action_actor_id: access\.user\.id/.test(adminAction)],
  ["proof route validates active admin", /access\.profile/.test(proofRoute)],
  ["proof signed URL lasts 60 seconds", /createSignedUrl\(record\.paymentProof\.id, 60\)/.test(proofRoute)],
  ["proof cleanup on failure", /remove\(\[proofPath\]\)/.test(repository)],
  ["booking code retries", /bookingCodeAttempts = 5/.test(repository)],
  ["public lookup requires code and email", /code.*email/s.test(publicLookup)],
  ["public lookup rate limited", /LOOKUP_RATE_LIMITED/.test(publicLookup)],
  ["lookup attempts audited", /booking_lookup_attempts/.test(customerMigration)],
  ["notification delivery audited", /notification_deliveries/.test(customerMigration)],
  ["notification idempotency unique", /idempotency_key text not null unique/.test(customerMigration)],
  ["email failure is isolated", /deliverBookingNotificationSafely/.test(notificationDelivery)],
  ["contact consent stored", /transactional_message_consent/.test(customerMigration)],
  ["booking creation v2 transactional", /create_booking_transaction_v2/.test(customerMigration)],
];

for (const [name, passed] of checks) {
  assert.equal(passed, true, `Contrato incumplido: ${name}`);
}

console.log(`Contrato de reservas verificado: ${checks.length} controles.`);
