import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

if (process.env.MIGRATE_DEMO_DATA !== "true") {
  console.error(
    "Migración cancelada. Define MIGRATE_DEMO_DATA=true únicamente después de revisar los datos demo.",
  );
  process.exitCode = 1;
} else {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Faltan las variables privadas de Supabase.");
  }

  const dataDirectory = path.join(process.cwd(), ".data", "bookings");
  const records = JSON.parse(
    await readFile(path.join(dataDirectory, "reservations.json"), "utf8"),
  );
  const proofNames = new Set(
    await readdir(path.join(dataDirectory, "proofs")),
  );
  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let migrated = 0;
  for (const record of records) {
    if (!proofNames.has(record.paymentProof.id)) {
      throw new Error(
        `La reserva demo ${record.bookingCode} no tiene comprobante local.`,
      );
    }
    const extension =
      record.paymentProof.type === "image/png"
        ? "png"
        : record.paymentProof.type === "image/webp"
          ? "webp"
          : "jpg";
    const proofPath = `demo-import/${record.id}/${crypto.randomUUID()}.${extension}`;
    const proof = await readFile(
      path.join(dataDirectory, "proofs", record.paymentProof.id),
    );
    const { error: uploadError } = await supabase.storage
      .from("booking-payment-proofs")
      .upload(proofPath, proof, {
        contentType: record.paymentProof.type,
        upsert: false,
      });
    if (uploadError) throw new Error("Falló la carga de un comprobante demo.");

    const { error } = await supabase.rpc("create_booking_transaction", {
      payload: {
        arrival_details: record.transportDetails.direct,
        booking_code: record.bookingCode,
        booking_mode: record.mode,
        buyer: {
          email: record.buyer.email,
          full_name: record.buyer.fullName,
          phone: record.buyer.phone,
        },
        food_details: record.foodDetails,
        participants: record.participants.map((participant, index) => ({
          full_name: participant.fullName,
          has_medical_condition:
            participant.hasMedicalCondition === "yes",
          medical_details: participant.medicalDetails,
          phone: participant.phone,
          physical_condition: participant.fitness,
          position: index + 1,
        })),
        payment_proof_path: proofPath,
        pending_hold_until: null,
        price_per_person: record.pricePerPersonCrc,
        quantity: record.quantity,
        selected_date: record.selectedDate,
        sinpe_account_holder: record.sinpeAccountHolder,
        sinpe_account_number: record.sinpeAccountNumber,
        timezone: "America/Costa_Rica",
        total_amount: record.total,
        tour_name: record.tourName,
        tour_slug: record.tourSlug,
        transport_details:
          record.mode === "gam_transport"
            ? record.transportDetails.gam_transport
            : record.mode === "private"
              ? record.transportDetails.private
              : record.transportDetails.direct,
      },
    });
    if (error) {
      await supabase.storage
        .from("booking-payment-proofs")
        .remove([proofPath]);
      throw new Error("Falló la transacción de una reserva demo.");
    }
    migrated += 1;
  }

  console.log(`Migración demo completada: ${migrated} reservas.`);
}
