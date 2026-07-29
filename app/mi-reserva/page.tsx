import type { Metadata } from "next";
import { Suspense } from "react";

import { MyBooking } from "@/components/booking/my-booking";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";

export const metadata: Metadata = {
  description:
    "Consulta de forma segura el estado de una reserva de Aventuras Sin Límites.",
  title: "Mi reserva",
};

export default function MyBookingPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#080a08] px-5 pb-20 pt-32 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<p className="text-stone-400">Cargando…</p>}>
            <MyBooking />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
