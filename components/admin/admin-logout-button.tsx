"use client";

import { useState } from "react";

export function AdminLogoutButton({
  label = "Cerrar sesión",
}: Readonly<{ label?: string }>) {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.assign("/admin/login");
    }
  };

  return (
    <button
      className="min-h-12 shrink-0 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-stone-400 outline-none transition hover:border-white/25 hover:bg-white/[0.04] hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-60"
      disabled={loading}
      onClick={logout}
      type="button"
    >
      {loading ? "Cerrando…" : label}
    </button>
  );
}
