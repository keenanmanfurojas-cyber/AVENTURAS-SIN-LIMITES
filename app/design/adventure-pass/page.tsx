import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  AdventurePass,
  type AdventurePassData,
} from "@/components/adventure-pass/adventure-pass";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Adventure Pass · Vista de diseño",
};

const mockAdventurePass: AdventurePassData = {
  code: "ASL-CE-DEMO7",
  date: "Domingo, 30 de agosto de 2026",
  explorers: 2,
  heroImage: "/images/tours/CIUDAD ESMERALDA/ciudad-esmeralda.webp",
  meetingPoint: "Entrada principal · Parque Nacional del Agua Juan Castro Blanco",
  recommendations: [
    "Llega 20 minutos antes de la hora indicada.",
    "Usa calzado de montaña y ropa de secado rápido.",
    "Lleva agua, protector solar y una capa impermeable.",
    "Conserva este pase disponible durante toda la expedición.",
  ],
  status: "confirmed",
  time: "6:00 a. m.",
  tourName: "Tour Ciudad Esmeralda",
};

export default function AdventurePassDesignPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="adventure-pass-page surface-grid min-h-screen bg-[#070606] px-4 py-12 sm:px-8 sm:py-20">
      <div className="adventure-pass-review-copy mx-auto mb-8 max-w-6xl">
        <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-[#b7e34b]">
          Vista temporal de diseño
        </p>
        <h2 className="mt-3 text-2xl font-extrabold uppercase tracking-[-0.035em] text-white sm:text-4xl">
          Adventure Pass
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
          Componente presentacional con datos sintéticos. El QR es únicamente
          visual y todavía no representa una reserva.
        </p>
      </div>
      <AdventurePass data={mockAdventurePass} />
    </main>
  );
}
