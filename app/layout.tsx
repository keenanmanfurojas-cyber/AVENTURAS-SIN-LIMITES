import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Instrument_Serif,
  Manrope,
  Poppins,
} from "next/font/google";
import type { ReactNode } from "react";

import { siteConfig } from "@/lib/site-config";

import "./globals.css";

const instrumentSerif = Instrument_Serif({
  display: "swap",
  fallback: ["Iowan Old Style", "Baskerville", "Times New Roman", "serif"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
});

const manrope = Manrope({
  display: "swap",
  fallback: ["Avenir Next", "Helvetica Neue", "Arial", "sans-serif"],
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: "variable",
});

const poppins = Poppins({
  display: "swap",
  fallback: ["Avenir Next", "Helvetica Neue", "Arial", "sans-serif"],
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["500", "700", "800"],
});

const cormorantGaramond = Cormorant_Garamond({
  display: "swap",
  fallback: ["Iowan Old Style", "Baskerville", "Times New Roman", "serif"],
  style: "italic",
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    `Experiencias de turismo de aventura en ${siteConfig.contact.operationArea}, por Keenan Adventures CR.`,
  creator: siteConfig.responsiblePerson,
  openGraph: {
    description: `Turismo de aventura en ${siteConfig.contact.operationArea}.`,
    locale: "es_CR",
    siteName: siteConfig.name,
    title: siteConfig.name,
    type: "website",
  },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body
        className={`${instrumentSerif.variable} ${manrope.variable} ${poppins.variable} ${cormorantGaramond.variable} bg-obsidian text-smoke antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
