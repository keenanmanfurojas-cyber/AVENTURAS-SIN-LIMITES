type FogOverlayProps = Readonly<{
  className?: string;
}>;

export function FogOverlay({ className = "" }: FogOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <span className="fog-layer fog-layer--one" />
      <span className="fog-layer fog-layer--two" />
    </div>
  );
}
