import { createHash } from "node:crypto";

import { getAdminAccess } from "@/lib/admin-auth";
import { getAdminBooking } from "@/lib/admin-bookings";
import { formatBookingDate } from "@/lib/booking-date";
import { formatCrc } from "@/lib/tour-utils";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]!);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getAdminAccess();
  if (!access.user) return new Response("Sesión no válida.", { status: 401 });
  if (!access.profile) return new Response("Acceso denegado.", { status: 403 });

  const record = await getAdminBooking(access.supabase, (await params).id);
  if (!record || record.status !== "approved" || !record.approvedAt) {
    return new Response("Recibo no disponible.", { status: 404 });
  }
  const verification = createHash("sha256")
    .update(`${record.bookingCode}:${record.approvedAt}:Aventuras Sin Límites`)
    .digest("hex")
    .slice(0, 16)
    .toUpperCase();
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Recibo ${escapeHtml(record.bookingCode)}</title>
  <style>body{font-family:Arial,sans-serif;background:#f4f6f2;color:#172017;padding:40px}.receipt{max-width:720px;margin:auto;background:white;padding:42px;border-radius:18px;border:1px solid #dce5d8}h1{margin:0;color:#17320d}.status{display:inline-block;background:#dfffad;padding:8px 14px;border-radius:999px;font-weight:700}table{width:100%;border-collapse:collapse;margin:28px 0}td{padding:12px 0;border-bottom:1px solid #e5e9e3}td:last-child{text-align:right;font-weight:700}.verify{font-family:monospace;letter-spacing:.08em}@media print{body{padding:0;background:white}.receipt{border:0}button{display:none}}</style></head>
  <body><main class="receipt"><p>Aventuras Sin Límites</p><h1>Confirmación de reserva</h1><p class="status">CONFIRMADA</p>
  <table><tr><td>Código</td><td>${escapeHtml(record.bookingCode)}</td></tr><tr><td>Responsable</td><td>${escapeHtml(record.buyer.fullName)}</td></tr><tr><td>Tour</td><td>${escapeHtml(record.tourName)}</td></tr><tr><td>Fecha</td><td>${escapeHtml(formatBookingDate(record.selectedDate))}</td></tr><tr><td>Participantes</td><td>${record.quantity}</td></tr><tr><td>Monto</td><td>${escapeHtml(formatCrc(record.total))}</td></tr><tr><td>Aprobada</td><td>${escapeHtml(new Date(record.approvedAt).toLocaleString("es-CR", { timeZone: "America/Costa_Rica" }))}</td></tr></table>
  <p>Contacto: ${escapeHtml(siteConfig.contact.whatsapp.displayNumber)} · ${escapeHtml(siteConfig.contact.email.address)}</p>
  <p>Identificador verificable: <span class="verify">${verification}</span></p>
  <button onclick="window.print()">Imprimir o guardar como PDF</button></main></body></html>`;
  return new Response(html, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
