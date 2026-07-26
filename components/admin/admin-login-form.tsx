"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = (await response.json()) as { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "No fue posible iniciar sesión.");
      return;
    }
    router.replace("/admin/reservas");
    router.refresh();
  };

  return (
    <form className="mt-7" onSubmit={submit}>
      <label className="block text-sm font-medium text-stone-300">
        Contraseña
        <input
          autoComplete="current-password"
          className="mt-2 min-h-12 w-full rounded-full border border-white/15 bg-black/25 px-5 text-white outline-none focus:border-[#b9ff4a]/60"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      <button
        className="mt-5 min-h-12 w-full rounded-full bg-[#b9ff4a] px-6 text-xs font-bold uppercase tracking-[0.14em] text-black"
        disabled={loading}
        type="submit"
      >
        {loading ? "Ingresando…" : "Entrar al panel"}
      </button>
    </form>
  );
}
