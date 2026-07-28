import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  bookingDetailsSelection,
  mapSupabaseBookingRow,
} from "@/lib/bookings/supabase-repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BookingRecord, GroupTourDate } from "@/types/booking";

const transientJwtErrorCode = "PGRST303";
const dashboardReadAttempts = 3;

type SupabaseReadResult<T> = {
  data: T | null;
  error: {
    code?: string;
    details?: string;
    hint?: string;
    message: string;
  } | null;
};

export type AdminDashboardData = {
  bucketIsPrivate: boolean | null;
  records: BookingRecord[];
  upcomingTourDates: GroupTourDate[];
};

export class AdminDataReadError extends Error {
  readonly code?: string;
  readonly details?: string;
  readonly hint?: string;
  readonly query: string;

  constructor(
    query: string,
    error: NonNullable<SupabaseReadResult<unknown>["error"]>,
  ) {
    super(`[${query}] ${error.message}`, { cause: error });
    this.name = "AdminDataReadError";
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
    this.query = query;
  }
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function readWithTransientJwtRetry<T>(
  query: string,
  read: () => PromiseLike<SupabaseReadResult<T>>,
) {
  let lastError: SupabaseReadResult<T>["error"] = null;

  for (let attempt = 0; attempt < dashboardReadAttempts; attempt += 1) {
    const result = await read();
    if (!result.error) return result.data;

    lastError = result.error;
    if (
      result.error.code !== transientJwtErrorCode ||
      attempt === dashboardReadAttempts - 1
    ) {
      break;
    }
    await wait(750 * (attempt + 1));
  }

  console.error("Admin Supabase read failed", {
    code: lastError?.code,
    details: lastError?.details,
    hint: lastError?.hint,
    message: lastError?.message,
    query,
  });
  throw new AdminDataReadError(query, lastError!);
}

export async function listAdminBookings(
  supabase: SupabaseClient,
): Promise<BookingRecord[]> {
  const data = await readWithTransientJwtRetry("bookings.details", () =>
    supabase
      .from("bookings")
      .select(bookingDetailsSelection)
      .order("created_at", { ascending: false }),
  );
  return (data ?? []).map(mapSupabaseBookingRow);
}

export async function getAdminBooking(
  supabase: SupabaseClient,
  id: string,
): Promise<BookingRecord | null> {
  const data = await readWithTransientJwtRetry("bookings.detail", () =>
    supabase
      .from("bookings")
      .select(bookingDetailsSelection)
      .eq("id", id)
      .maybeSingle(),
  );
  return data ? mapSupabaseBookingRow(data) : null;
}

export async function listUpcomingTourDates(
  supabase: SupabaseClient,
  today: string,
): Promise<GroupTourDate[]> {
  const data = await readWithTransientJwtRetry("tour_dates.upcoming", () =>
    supabase
      .from("tour_dates")
      .select("id, tour_slug, tour_name, date, start_time, capacity, is_active")
      .eq("is_active", true)
      .gte("date", today)
      .order("date", { ascending: true }),
  );

  return (data ?? []).map((row) => ({
    availableSpots: Number.isFinite(row.capacity) ? row.capacity : 0,
    capacity: Number.isFinite(row.capacity) ? row.capacity : 0,
    date: row.date,
    id: row.id,
    isActive: row.is_active,
    startTime: row.start_time,
    tourName: row.tour_name,
    tourSlug: row.tour_slug,
  }));
}

async function getPrivateBucketStatus() {
  try {
    const { data, error } = await createSupabaseAdminClient().storage.getBucket(
      "booking-payment-proofs",
    );
    if (error) return null;
    return data.public === false;
  } catch {
    return null;
  }
}

export async function getAdminDashboardData(
  supabase: SupabaseClient,
  today: string,
): Promise<AdminDashboardData> {
  const [records, upcomingTourDates, bucketIsPrivate] = await Promise.all([
    listAdminBookings(supabase),
    listUpcomingTourDates(supabase, today),
    getPrivateBucketStatus(),
  ]);

  return { bucketIsPrivate, records, upcomingTourDates };
}
