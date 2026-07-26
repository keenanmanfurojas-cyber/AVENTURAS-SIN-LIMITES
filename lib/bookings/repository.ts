import type {
  BookingRecord,
  BookingStatus,
  GroupTourDate,
  PrivateAvailability,
} from "@/types/booking";

export type BookingFilters = {
  code?: string;
  date?: string;
  mode?: string;
  name?: string;
  search?: string;
  status?: BookingStatus | "";
};

export type BookingStatusUpdate = {
  adminNotes?: string;
  reason?: string;
  status: Exclude<BookingStatus, "pending_review">;
};

export interface BookingRepository {
  create(record: BookingRecord, proof: File): Promise<BookingRecord>;
  createBooking(record: BookingRecord, proof: File): Promise<BookingRecord>;
  getBookingByCode(code: string): Promise<BookingRecord | null>;
  getBookingDetails(id: string): Promise<BookingRecord | null>;
  findById(id: string): Promise<BookingRecord | null>;
  list(filters?: BookingFilters): Promise<BookingRecord[]>;
  listBookings(filters?: BookingFilters): Promise<BookingRecord[]>;
  readPaymentProof(id: string): Promise<{ bytes: Buffer; record: BookingRecord } | null>;
  getPaymentProofUrl(id: string): Promise<string | null>;
  updateStatus(id: string, update: BookingStatusUpdate): Promise<BookingRecord | null>;
  approveBooking(id: string, adminNotes?: string): Promise<BookingRecord | null>;
  rejectBooking(
    id: string,
    reason: string,
    adminNotes?: string,
  ): Promise<BookingRecord | null>;
  cancelBooking(
    id: string,
    reason: string,
    adminNotes?: string,
  ): Promise<BookingRecord | null>;
  getPrivateAvailability(date: string): Promise<PrivateAvailability>;
  getGroupTourDates(tourSlug: string): Promise<GroupTourDate[]>;
  createTourDate(date: Omit<GroupTourDate, "availableSpots" | "id">): Promise<GroupTourDate>;
  updateTourDate(
    id: string,
    date: Partial<Omit<GroupTourDate, "availableSpots" | "id">>,
  ): Promise<GroupTourDate | null>;
  blockDate(date: string, reason: string): Promise<void>;
  unblockDate(date: string): Promise<void>;
}
