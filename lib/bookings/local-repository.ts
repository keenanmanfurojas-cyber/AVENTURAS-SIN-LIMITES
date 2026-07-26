import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  BookingFilters,
  BookingRepository,
  BookingStatusUpdate,
} from "@/lib/bookings/repository";
import type { BookingRecord } from "@/types/booking";

const dataDirectory = path.join(process.cwd(), ".data", "bookings");
const proofDirectory = path.join(dataDirectory, "proofs");
const recordsFile = path.join(dataDirectory, "reservations.json");

async function ensureStorage() {
  await mkdir(proofDirectory, { recursive: true });
  try {
    await readFile(recordsFile, "utf8");
  } catch {
    await writeFile(recordsFile, "[]", { encoding: "utf8", flag: "wx" }).catch(
      () => undefined,
    );
  }
}

async function readRecords(): Promise<BookingRecord[]> {
  await ensureStorage();
  return JSON.parse(await readFile(recordsFile, "utf8")) as BookingRecord[];
}

async function writeRecords(records: BookingRecord[]) {
  const temporaryFile = `${recordsFile}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(records, null, 2), "utf8");
  await rename(temporaryFile, recordsFile);
}

export class LocalBookingRepository implements BookingRepository {
  async create(record: BookingRecord, proof: File) {
    const records = await readRecords();
    const proofPath = path.join(proofDirectory, record.paymentProof.id);
    await writeFile(proofPath, Buffer.from(await proof.arrayBuffer()), {
      flag: "wx",
    });
    records.push(record);
    await writeRecords(records);
    return record;
  }

  async findById(id: string) {
    return (await readRecords()).find((record) => record.id === id) ?? null;
  }

  async list(filters: BookingFilters = {}) {
    const query = filters.search?.trim().toLocaleLowerCase("es") ?? "";
    return (await readRecords())
      .filter((record) => !filters.status || record.status === filters.status)
      .filter((record) => !filters.date || record.selectedDate === filters.date)
      .filter((record) => !filters.mode || record.mode === filters.mode)
      .filter(
        (record) =>
          !filters.name ||
          record.buyer.fullName
            .toLocaleLowerCase("es")
            .includes(filters.name.toLocaleLowerCase("es")),
      )
      .filter(
        (record) =>
          !filters.code ||
          record.bookingCode
            .toLocaleLowerCase("es")
            .includes(filters.code.toLocaleLowerCase("es")),
      )
      .filter(
        (record) =>
          !query ||
          [record.bookingCode, record.buyer.fullName, record.buyer.email]
            .join(" ")
            .toLocaleLowerCase("es")
            .includes(query),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async readPaymentProof(id: string) {
    const record = await this.findById(id);
    if (!record) return null;
    const bytes = await readFile(
      path.join(proofDirectory, record.paymentProof.id),
    );
    return { bytes, record };
  }

  async updateStatus(id: string, update: BookingStatusUpdate) {
    const records = await readRecords();
    const index = records.findIndex((record) => record.id === id);
    if (index < 0) return null;
    const current = records[index];
    const now = new Date().toISOString();
    const updated: BookingRecord = {
      ...current,
      adminNotes: update.adminNotes?.trim() ?? current.adminNotes,
      approvedAt: update.status === "approved" ? now : current.approvedAt,
      cancelledAt: update.status === "cancelled" ? now : current.cancelledAt,
      rejectionReason:
        update.status === "rejected" || update.status === "cancelled"
          ? update.reason?.trim() || null
          : null,
      status: update.status,
      updatedAt: now,
    };
    records[index] = updated;
    await writeRecords(records);
    return updated;
  }
}
