"use client";

export default function AdminError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <section className="rounded-[2rem] border border-red-300/20 bg-red-300/[0.06] p-7">
      <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold text-white">
        No pudimos cargar el panel
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-300">
        Revisa la conexión e inténtalo nuevamente.
      </p>
      <button
        className="mt-5 min-h-12 rounded-full bg-white px-6 text-xs font-bold text-black outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        onClick={reset}
        type="button"
      >
        Reintentar
      </button>
    </section>
  );
}
