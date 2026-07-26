import type { BookingRecord, BookingStatus } from "@/types/booking";

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
  findById(id: string): Promise<BookingRecord | null>;
  list(filters?: BookingFilters): Promise<BookingRecord[]>;
  readPaymentProof(id: string): Promise<{ bytes: Buffer; record: BookingRecord } | null>;
  updateStatus(id: string, update: BookingStatusUpdate): Promise<BookingRecord | null>;
}
