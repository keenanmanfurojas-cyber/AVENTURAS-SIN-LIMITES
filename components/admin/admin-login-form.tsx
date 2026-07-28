"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "@/components/admin/admin-icon";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "No fue posible iniciar sesión.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el sistema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-7 space-y-5" onSubmit={submit}>
      <label className="block text-xs font-bold text-stone-300">
        Correo electrónico
        <span className="relative mt-2 block">
          <AdminIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-500" name="mail" />
          <input
          autoComplete="username"
          className="admin-control w-full rounded-xl pl-12 pr-4 outline-none"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
          />
        </span>
      </label>
      <label className="block text-xs font-bold text-stone-300">
        Contraseña
        <span className="relative mt-2 block">
          <AdminIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-500" name="lock" />
          <input
          autoComplete="current-password"
          className="admin-control w-full rounded-xl pl-12 pr-4 outline-none"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
          />
        </span>
      </label>
      {error ? (
        <p
          className="rounded-2xl border border-red-300/20 bg-red-300/[0.07] p-4 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        aria-busy={loading}
        className="admin-action flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#b9ff4a] px-7 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#071006] outline-none transition hover:bg-[#d0ff87] focus-visible:ring-2 focus-visible:ring-[#b9ff4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070907] disabled:cursor-wait disabled:opacity-70"
        disabled={loading}
        type="submit"
      >
        {loading ? "Verificando acceso…" : "Entrar al panel"}
        {!loading ? <AdminIcon className="size-4" name="arrow" /> : null}
      </button>
    </form>
  );
}
