import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Acceso administrativo" };

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin/reservas");
  return (
    <main className="grid min-h-screen place-items-center bg-[#070907] px-6 py-16">
      <section className="w-full max-w-md rounded-[2rem] border border-[#b9ff4a]/15 bg-white/[0.035] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b9ff4a]">
          Área privada
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-manrope)] text-3xl font-extrabold text-white">
          Reservas Ciudad Esmeralda
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-400">
          Ingresa la contraseña administrativa configurada en el servidor.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
