import "server-only";

import serverlessChromium from "@sparticuz/chromium";
import {
  chromium as playwrightChromium,
  type Browser,
  type Page,
} from "playwright-core";
import QRCode from "qrcode";

import type { AdventurePassData } from "@/components/adventure-pass/adventure-pass";
import { createAdventurePassRenderToken } from "@/lib/adventure-pass-token";
import { formatBookingDate } from "@/lib/booking-date";
import type { BookingRecord } from "@/types/booking";

type GenerateAdventurePassPdfOptions = {
  baseUrl?: string;
  lookupUrl?: string;
};

export type AdventurePassPdfErrorCode =
  | "browser_unavailable"
  | "empty_pdf"
  | "generation_failed"
  | "invalid_pdf"
  | "resource_failed"
  | "timeout";

export class AdventurePassPdfError extends Error {
  constructor(readonly code: AdventurePassPdfErrorCode) {
    super("No fue posible generar el Adventure Pass.");
    this.name = "AdventurePassPdfError";
  }
}

const generationTimeoutMs = 45_000;
const navigationTimeoutMs = 20_000;
const resourceTimeoutMs = 10_000;
const minimumPdfBytes = 10_000;

function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function launchBrowser() {
  try {
    if (isServerlessRuntime()) {
      return await playwrightChromium.launch({
        args: serverlessChromium.args,
        executablePath: await serverlessChromium.executablePath(),
        headless: true,
      });
    }
    return await playwrightChromium.launch({
      executablePath: playwrightChromium.executablePath(),
      headless: true,
    });
  } catch {
    throw new AdventurePassPdfError("browser_unavailable");
  }
}

async function withTimeout<T>(
  operation: Promise<T>,
  milliseconds: number,
  code: AdventurePassPdfErrorCode = "timeout",
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new AdventurePassPdfError(code)),
          milliseconds,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function assertRenderResources(page: Page, failedResources: Set<string>) {
  await withTimeout(
    page.evaluate(async () => {
      await document.fonts.ready;
      const images = [...document.images];
      await Promise.all(
        images.map((image) =>
          image.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                image.addEventListener("load", () => resolve(), { once: true });
                image.addEventListener("error", () => resolve(), { once: true });
              }),
        ),
      );
      return {
        fontsLoaded: document.fonts.status === "loaded",
        imagesLoaded: images.every(
          (image) => image.complete && image.naturalWidth > 0,
        ),
      };
    }),
    resourceTimeoutMs,
    "resource_failed",
  ).then(({ fontsLoaded, imagesLoaded }) => {
    if (!fontsLoaded || !imagesLoaded || failedResources.size > 0) {
      throw new AdventurePassPdfError("resource_failed");
    }
  });
}

function assertValidPdf(pdf: Buffer) {
  if (pdf.length < minimumPdfBytes) {
    throw new AdventurePassPdfError("empty_pdf");
  }
  if (pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new AdventurePassPdfError("invalid_pdf");
  }
  const ascii = pdf.toString("latin1");
  if (!/\/Count\s+1\b/.test(ascii)) {
    throw new AdventurePassPdfError("invalid_pdf");
  }
}

function meetingPoint(record: BookingRecord) {
  if (record.mode === "gam_transport") {
    return (
      record.transportDetails.gam_transport.departurePoint ||
      "Punto de salida coordinado por el equipo"
    );
  }
  if (record.mode === "private") {
    return (
      record.transportDetails.private.pickupZone ||
      "Punto de encuentro coordinado por el equipo"
    );
  }
  return (
    record.transportDetails.direct.transportMethod ||
    "Entrada principal · punto de encuentro coordinado"
  );
}

function expeditionTime(record: BookingRecord) {
  if (record.mode === "direct") {
    return record.transportDetails.direct.arrivalTime || "Hora por coordinar";
  }
  return "Hora coordinada por el equipo";
}

export function bookingToAdventurePassData(
  record: BookingRecord,
): AdventurePassData {
  return {
    code: record.bookingCode,
    date: formatBookingDate(record.selectedDate),
    explorers: record.quantity,
    heroImage: "/images/tours/CIUDAD ESMERALDA/ciudad-esmeralda.webp",
    meetingPoint: meetingPoint(record),
    recommendations: [
      "Llega 20 minutos antes de la hora indicada.",
      "Usa calzado de montaña y ropa de secado rápido.",
      "Lleva agua, protector solar y una capa impermeable.",
      "Conserva este pase disponible durante toda la expedición.",
    ],
    status:
      record.status === "approved"
        ? "confirmed"
        : record.status === "rejected"
          ? "review"
          : "pending",
    time: expeditionTime(record),
    tourName: record.tourName,
  };
}

export async function generateAdventurePassPdf(
  record: BookingRecord,
  options: GenerateAdventurePassPdfOptions = {},
) {
  return withTimeout(
    generateAdventurePassPdfWithinDeadline(record, options),
    generationTimeoutMs,
  );
}

async function generateAdventurePassPdfWithinDeadline(
  record: BookingRecord,
  options: GenerateAdventurePassPdfOptions,
) {
  const baseUrl = (
    options.baseUrl ||
    process.env.APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  const data = bookingToAdventurePassData(record);
  if (options.lookupUrl) {
    data.qrImage = await QRCode.toDataURL(options.lookupUrl, {
      color: { dark: "#17382c", light: "#f8f4e9" },
      errorCorrectionLevel: "M",
      margin: 2,
      width: 512,
    });
  }
  const token = createAdventurePassRenderToken(data);
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage({
      viewport: { height: 794, width: 1123 },
    });
    const failedResources = new Set<string>();
    page.on("requestfailed", (request) => {
      const resourceType = request.resourceType();
      if (resourceType === "document" || resourceType === "font" || resourceType === "image") {
        failedResources.add(resourceType);
      }
    });
    const internalHeaders: Record<string, string> = {
      "x-asl-adventure-pass-render": token,
    };
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (bypassSecret) {
      Object.assign(internalHeaders, {
        "x-vercel-protection-bypass": bypassSecret,
        "x-vercel-set-bypass-cookie": "true",
      });
    }
    await page.setExtraHTTPHeaders(internalHeaders);
    const response = await page.goto(
      `${baseUrl}/design/adventure-pass/print`,
      { timeout: navigationTimeoutMs, waitUntil: "networkidle" },
    );
    if (
      !response?.ok() ||
      !page.url().includes("/design/adventure-pass/print")
    ) {
      throw new AdventurePassPdfError("resource_failed");
    }
    await page.emulateMedia({ media: "print" });
    await assertRenderResources(page, failedResources);
    const pdf = Buffer.from(
      await withTimeout(
        page.pdf({
          format: "A4",
          landscape: true,
          margin: { bottom: "8mm", left: "8mm", right: "8mm", top: "8mm" },
          preferCSSPageSize: true,
          printBackground: true,
        }),
        15_000,
      ),
    );
    assertValidPdf(pdf);
    return pdf;
  } catch (error) {
    if (error instanceof AdventurePassPdfError) throw error;
    throw new AdventurePassPdfError("generation_failed");
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
