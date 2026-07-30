"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { BookingRecord } from "@/types/booking";

type Action = "activate" | "approve" | "delete" | "edit" | "inactivate" | "note" | "reject";

export function ReservationActions({
  administrativeControlAvailable,
  record,
  role,
}: Readonly<{
  administrativeControlAvailable: boolean;
  record: BookingRecord;
  role: "admin" | "superadmin";
}>) {
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);
  const [draft, setDraft] = useState(record);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const [secondConfirmation, setSecondConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const close = () => {
    if (loading) return;
    setAction(null); setReason(""); setNote(""); setCode("");
    setSecondConfirmation(false); setError("");
  };

  const submit = async () => {
    if (!action) return;
    if ((action === "activate" || action === "inactivate" || action === "reject" || action === "delete") && reason.trim().length < 3) {
      setError("Indica un motivo de al menos 3 caracteres."); return;
    }
    if (action === "note" && !note.trim()) { setError("Escribe la nota administrativa."); return; }
    if (action === "delete" && (code !== record.bookingCode || !secondConfirmation)) {
      setError("Escribe el código exacto y confirma por segunda vez."); return;
    }
    if (action === "edit" && draft.quantity !== draft.participants.length) {
      setError("La cantidad debe coincidir con el número de participantes."); return;
    }
    setLoading(true); setError("");
    const body = action === "edit" ? {
      action,
      adminNotes: draft.adminNotes,
      buyer: draft.buyer,
      mode: draft.mode,
      participants: draft.participants.map((participant) => ({
        fitness: participant.fitness,
        fullName: participant.fullName,
        hasMedicalCondition: participant.hasMedicalCondition === "yes",
        medicalDetails: participant.medicalDetails,
        phone: participant.phone,
      })),
      quantity: draft.quantity,
      selectedDate: draft.selectedDate,
      selectedTime: draft.selectedTime?.slice(0, 5) ?? "",
      total: draft.total,
    } : action === "note" ? { action, note }
      : action === "approve" ? { action, adminNotes: note }
        : action === "reject" ? { action, adminNotes: note, reason }
          : action === "delete" ? { bookingCode: code, confirmed: true, reason }
            : { action, reason };
    try {
      const response = await fetch(`/api/admin/reservas/${record.id}`, {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: action === "delete" ? "DELETE" : "PATCH",
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setError(result.error ?? "No fue posible completar la operación."); return; }
      if (action === "delete") { router.push("/admin/reservas?filter=inactive"); return; }
      setAction(null);
      setReason("");
      setNote("");
      setCode("");
      setSecondConfirmation(false);
      router.refresh();
    } catch { setError("No fue posible conectar con el sistema."); }
    finally { setLoading(false); }
  };

  const resizeParticipants = (quantity: number) => {
    const next = [...draft.participants];
    while (next.length < quantity) next.push({
      email: "", fitness: "", fullName: "", hasMedicalCondition: "no",
      id: `new-${next.length}`, medicalDetails: "", phone: "",
    });
    setDraft({ ...draft, participants: next.slice(0, quantity), quantity });
  };

  return (
    <>
      <section className="admin-panel scroll-mt-5 rounded-[1.5rem] p-5 sm:p-6" id="acciones">
        <h2 className="text-xl font-extrabold text-white">Acciones administrativas</h2>
        <p className="mt-2 text-sm leading-6 text-stone-400">Cada operación queda asociada a tu cuenta.</p>
        <div className="mt-5 grid gap-3">
          {administrativeControlAvailable ? (
            <button className="admin-action-button" onClick={() => setAction("edit")} type="button">Editar</button>
          ) : null}
          {!record.archivedAt && record.status === "pending_review" ? (
            <div className="grid grid-cols-2 gap-3">
              <button className="admin-action-button" onClick={() => setAction("approve")} type="button">Aprobar</button>
              <button className="admin-danger-button" onClick={() => setAction("reject")} type="button">Rechazar</button>
            </div>
          ) : null}
          <button className="admin-action-button" onClick={() => setAction("note")} type="button">Agregar nota</button>
          {administrativeControlAvailable ? (
            record.archivedAt ? (
              <button className="admin-action-button" onClick={() => setAction("activate")} type="button">Activar reserva</button>
            ) : (
              <button className="admin-danger-button" onClick={() => setAction("inactivate")} type="button">Inactivar reserva</button>
            )
          ) : (
            <p className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm text-amber-100">
              Las acciones avanzadas estarán disponibles cuando la migración administrativa esté aplicada.
            </p>
          )}
          {administrativeControlAvailable && record.archivedAt && role === "superadmin" ? (
            <details className="rounded-xl border border-red-300/20 p-3">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-red-200">Acciones avanzadas</summary>
              <button className="admin-danger-button mt-3 w-full" onClick={() => setAction("delete")} type="button">Eliminar definitivamente</button>
            </details>
          ) : null}
        </div>
      </section>

      {action ? (
        <div aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-4 backdrop-blur-md" role="dialog">
          <div className={`admin-panel mx-auto my-6 rounded-[1.75rem] bg-[#0c110d] p-6 ${action === "edit" ? "max-w-4xl" : "max-w-lg"}`}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9ff4a]">{record.bookingCode}</p>
            <h2 className="mt-3 text-2xl font-extrabold text-white">
              {action === "edit" ? "Editar reserva" : action === "activate" ? "Activar reserva"
                : action === "inactivate" ? "Inactivar reserva" : action === "delete" ? "Eliminación definitiva"
                  : action === "note" ? "Nueva nota" : action === "approve" ? "Confirmar aprobación" : "Confirmar rechazo"}
            </h2>
            {action === "inactivate" ? <p className="mt-3 text-sm leading-6 text-stone-300">Esta reserva dejará de estar activa, no consumirá cupo y no contará en ingresos. Su historial se conservará.</p> : null}
            {action === "delete" ? <p className="mt-3 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm leading-6 text-red-100">Esta acción eliminará definitivamente la reserva y sus datos relacionados. No podrá deshacerse. Se eliminarán participantes, historial ligado, sincronizaciones y comprobante; el comprador solo si no está compartido.</p> : null}
            {action === "edit" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Nombre"><input required value={draft.buyer.fullName} onChange={(e) => setDraft({...draft,buyer:{...draft.buyer,fullName:e.target.value}})} /></Field>
                <Field label="Correo"><input required type="email" value={draft.buyer.email} onChange={(e) => setDraft({...draft,buyer:{...draft.buyer,email:e.target.value}})} /></Field>
                <Field label="Teléfono"><input required value={draft.buyer.phone} onChange={(e) => setDraft({...draft,buyer:{...draft.buyer,phone:e.target.value}})} /></Field>
                <Field label="Fecha"><input required type="date" value={draft.selectedDate} onChange={(e) => setDraft({...draft,selectedDate:e.target.value})} /></Field>
                <Field label="Hora"><input type="time" value={draft.selectedTime?.slice(0,5) ?? ""} onChange={(e) => setDraft({...draft,selectedTime:e.target.value})} /></Field>
                <Field label="Participantes"><input min={1} max={50} type="number" value={draft.quantity} onChange={(e) => resizeParticipants(Number(e.target.value))} /></Field>
                <Field label="Modalidad"><select value={draft.mode} onChange={(e) => setDraft({...draft,mode:e.target.value as BookingRecord["mode"]})}><option value="direct">Directa</option><option value="gam_transport">Transporte GAM</option><option value="private">Privada</option></select></Field>
                <Field label="Monto CRC"><input min={0} type="number" value={draft.total} onChange={(e) => setDraft({...draft,total:Number(e.target.value)})} /></Field>
                <Field label="Notas internas" wide><textarea value={draft.adminNotes} onChange={(e) => setDraft({...draft,adminNotes:e.target.value})} /></Field>
                <div className="sm:col-span-2 space-y-3">
                  <h3 className="font-bold text-white">Datos de participantes</h3>
                  {draft.participants.map((participant, index) => (
                    <div className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-2" key={participant.id}>
                      <Field label={`Participante ${index + 1}`}><input value={participant.fullName} onChange={(e) => setDraft({...draft,participants:draft.participants.map((p,i)=>i===index?{...p,fullName:e.target.value}:p)})} /></Field>
                      <Field label="Teléfono"><input value={participant.phone} onChange={(e) => setDraft({...draft,participants:draft.participants.map((p,i)=>i===index?{...p,phone:e.target.value}:p)})} /></Field>
                      <Field label="Condición física"><input value={participant.fitness} onChange={(e) => setDraft({...draft,participants:draft.participants.map((p,i)=>i===index?{...p,fitness:e.target.value}:p)})} /></Field>
                      <Field label="Condición médica"><select value={participant.hasMedicalCondition} onChange={(e) => setDraft({...draft,participants:draft.participants.map((p,i)=>i===index?{...p,hasMedicalCondition:e.target.value as "yes"|"no"}:p)})}><option value="no">No</option><option value="yes">Sí</option></select></Field>
                      {participant.hasMedicalCondition === "yes" ? <Field label="Detalle médico" wide><textarea value={participant.medicalDetails} onChange={(e) => setDraft({...draft,participants:draft.participants.map((p,i)=>i===index?{...p,medicalDetails:e.target.value}:p)})} /></Field> : null}
                    </div>
                  ))}
                </div>
                <p className="sm:col-span-2 rounded-xl bg-amber-300/5 p-3 text-sm text-amber-100">Al continuar confirmarás explícitamente el guardado. La disponibilidad se comprobará nuevamente en el servidor.</p>
              </div>
            ) : null}
            {action !== "edit" && action !== "approve" ? <Field label={action === "note" ? "Nota *" : "Motivo *"}><textarea autoFocus value={action === "note" ? note : reason} onChange={(e) => action === "note" ? setNote(e.target.value) : setReason(e.target.value)} /></Field> : null}
            {action === "approve" || action === "reject" ? <Field label="Nota interna (opcional)"><textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field> : null}
            {action === "delete" ? <>
              <Field label={`Escribe ${record.bookingCode}`}><input value={code} onChange={(e) => setCode(e.target.value)} /></Field>
              <label className="mt-4 flex gap-3 text-sm text-stone-300"><input checked={secondConfirmation} onChange={(e) => setSecondConfirmation(e.target.checked)} type="checkbox" /> Confirmo por segunda vez que comprendo que es irreversible.</label>
            </> : null}
            {error ? <p className="mt-4 text-sm text-red-300" role="alert">{error}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="admin-action-button" disabled={loading} onClick={close} type="button">Volver</button>
              <button className={action === "delete" || action === "inactivate" || action === "reject" ? "admin-danger-button" : "admin-action-button"} disabled={loading} onClick={submit} type="button">{loading ? "Guardando…" : action === "edit" ? "Confirmar y guardar" : "Confirmar"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ children, label, wide = false }: Readonly<{ children: React.ReactNode; label: string; wide?: boolean }>) {
  return <label className={`mt-4 block text-sm font-medium text-stone-300 ${wide ? "sm:col-span-2" : ""}`}>{label}<span className="[&>*]:admin-control mt-2 block [&>*]:min-h-12 [&>*]:w-full [&>*]:rounded-xl [&>*]:p-3">{children}</span></label>;
}
