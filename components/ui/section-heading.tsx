type SectionHeadingProps = Readonly<{
  align?: "left" | "center";
  eyebrow: string;
  title: string;
  description?: string;
}>;

export function SectionHeading({
  align = "left",
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  const alignment =
    align === "center"
      ? "mx-auto items-center text-center"
      : "items-start text-left";

  return (
    <div className={`flex max-w-3xl flex-col ${alignment}`}>
      <div className="mb-5 flex items-center gap-4">
        <span className="size-2 rounded-full bg-[#b9ff4a] shadow-[0_0_18px_rgba(185,255,74,0.35)]" />
        <p className="type-badge font-[family-name:var(--font-poppins)] text-[#b9ff4a]">
          {eyebrow}
        </p>
      </div>
      <h2 className="type-h2 text-balance text-smoke">
        {title}
      </h2>
      {description ? (
        <p className="mt-6 max-w-2xl font-[family-name:var(--font-poppins)] text-sm font-medium leading-7 text-stone-400 sm:text-base sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
