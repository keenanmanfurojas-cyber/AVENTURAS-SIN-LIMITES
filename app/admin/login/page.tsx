import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { OfficialLogo } from "@/components/brand/official-logo";
import { AdminIcon } from "@/components/admin/admin-icon";
import { getAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Acceso administrativo" };

export default async function AdminLoginPage() {
  const { profile, user } = await getAdminAccess();
  if (user && profile) redirect("/admin");

  return (
    <main className="admin-ui admin-atmosphere relative grid min-h-screen place-items-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-20 top-1/3 h-px w-80 rotate-45 bg-gradient-to-r from-transparent via-[#b9ff4a]/30 to-transparent" />
      <section className="admin-panel relative w-full max-w-[29rem] overflow-hidden rounded-[2rem] p-6 sm:p-9">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#b9ff4a]/70 to-transparent" />
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl border border-[#b9ff4a]/20 bg-[#b9ff4a]/[0.07]">
            <OfficialLogo className="size-12" priority sizes="48px" />
          </span>
          <p className="text-[0.65rem] font-extrabold uppercase leading-5 tracking-[0.2em] text-[#b9ff4a]">
            Aventuras<br />Sin Límites
          </p>
        </div>
        <p className="mt-8 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-stone-500">
          <AdminIcon className="size-4" name="map" /> Centro de operaciones
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
          Bienvenido de vuelta
        </h1>
        {user ? (
          <>
            <div
              className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-5"
              role="alert"
            >
              <p className="font-semibold text-amber-100">Acceso denegado</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                La cuenta autenticada no tiene un perfil administrativo activo.
              </p>
            </div>
            <div className="mt-5">
              <AdminLogoutButton label="Cerrar sesión y volver" />
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              Accede al control de reservas y salidas de aventura.
            </p>
            <AdminLoginForm />
            <p className="mt-6 flex items-start gap-2 border-t border-white/[0.08] pt-5 text-xs leading-5 text-stone-500">
              <AdminIcon className="mt-0.5 size-4 shrink-0 text-[#b9ff4a]/70" name="shield" />
              Área privada protegida. El acceso y las operaciones administrativas quedan registrados.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
