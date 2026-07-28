export default function AdminLoading() {
  return (
    <div aria-live="polite" className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-full bg-white/[0.06]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            className="h-32 animate-pulse rounded-[1.75rem] bg-white/[0.04]"
            key={index}
          />
        ))}
      </div>
      <p className="sr-only">Cargando panel administrativo…</p>
    </div>
  );
}
