type TemporaryMarkProps = Readonly<{
  className?: string;
}>;

export function TemporaryMark({ className = "" }: TemporaryMarkProps) {
  return (
    <div
      aria-label="Marca temporal de Aventuras Sin Límites"
      className={`relative grid size-16 place-items-center sm:size-[4.5rem] ${className}`}
    >
      <span className="absolute inset-0 rotate-45 border border-sand/45" />
      <span className="absolute inset-[7px] rotate-45 border border-sand/20" />
      <svg
        aria-hidden="true"
        className="relative h-8 w-10 text-sand"
        fill="none"
        viewBox="0 0 48 34"
      >
        <path
          d="M3 29 18.5 7l5.5 8 4-6 17 20H3Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
        />
        <path
          d="m12.5 29 11-14 4.5 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.25"
        />
      </svg>
    </div>
  );
}
