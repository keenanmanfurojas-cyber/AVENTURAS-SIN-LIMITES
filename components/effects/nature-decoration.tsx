type NatureDecorationProps = Readonly<{
  className?: string;
  variant: "birds" | "foliage" | "footprints" | "roots";
}>;

export function NatureDecoration({
  className = "",
  variant,
}: NatureDecorationProps) {
  if (variant === "birds") {
    return (
      <svg
        aria-hidden="true"
        className={`nature-birds pointer-events-none ${className}`}
        fill="none"
        viewBox="0 0 220 100"
      >
        <path
          className="nature-bird nature-bird--one"
          d="M12 50c13-14 26-14 39 0 13-14 26-14 39 0"
        />
        <path
          className="nature-bird nature-bird--two"
          d="M96 25c10-10 20-10 30 0 10-10 20-10 30 0"
        />
        <path
          className="nature-bird nature-bird--three"
          d="M145 69c9-9 18-9 27 0 9-9 18-9 27 0"
        />
      </svg>
    );
  }

  if (variant === "roots") {
    return (
      <svg
        aria-hidden="true"
        className={`nature-roots pointer-events-none ${className}`}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 180"
      >
        <path
          className="nature-root nature-root--main"
          d="M-20 38c126 5 185 41 282 42 105 1 154-34 254-25 101 9 126 62 240 60 106-2 148-49 260-40 94 8 158 47 246 34 67-10 111-42 198-37"
        />
        <path
          className="nature-root nature-root--branch"
          d="M205 75c-21 29-53 45-91 57m403-75c-11 33-38 63-78 88m323-31c-3 24-22 43-55 58m311-98c18 25 49 43 91 52m150-17c23 22 57 34 103 38"
        />
        <path
          className="nature-root nature-root--fine"
          d="M286 79c-7 18-24 32-50 43m303-62c13 22 37 39 72 49m185 2c15 19 38 32 70 40m190-72c-12 20-34 36-65 48"
        />
      </svg>
    );
  }

  if (variant === "foliage") {
    return (
      <svg
        aria-hidden="true"
        className={`nature-foliage pointer-events-none ${className}`}
        fill="none"
        viewBox="0 0 180 260"
      >
        <path className="nature-stem" d="M24 253C43 188 79 126 151 22" />
        <g className="nature-leaf nature-leaf--one">
          <path d="M56 186c-37-5-46-29-43-54 29-2 50 12 43 54Z" />
          <path d="m20 139 36 47" />
        </g>
        <g className="nature-leaf nature-leaf--two">
          <path d="M82 137c-2-37 22-53 48-55 8 28-3 52-48 55Z" />
          <path d="m123 89-41 48" />
        </g>
        <g className="nature-leaf nature-leaf--three">
          <path d="M111 87c-30-14-34-39-24-61 27 6 42 25 24 61Z" />
          <path d="m91 33 20 54" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={`nature-footprints pointer-events-none ${className}`}
      fill="none"
      viewBox="0 0 120 300"
    >
      {[0, 1, 2, 3].map((step) => (
        <g
          className={`nature-footprint nature-footprint--${step + 1}`}
          key={step}
          transform={`translate(${step % 2 === 0 ? 18 : 62} ${step * 68 + 8}) rotate(${step % 2 === 0 ? -14 : 14})`}
        >
          <path d="M15 2c11-3 20 4 22 16l2 13c2 10-3 19-12 21-10 2-18-5-18-15l1-13-5-8C0 9 6 4 15 2Z" />
          <path d="M11 15c7 3 15 3 24 0M10 24c8 3 17 3 27 0M10 34h28" />
        </g>
      ))}
    </svg>
  );
}
