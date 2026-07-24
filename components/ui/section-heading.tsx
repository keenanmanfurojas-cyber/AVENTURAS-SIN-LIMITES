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
        <span className="h-px w-8 bg-sand/60" />
        <p className="type-badge text-lava">
          {eyebrow}
        </p>
      </div>
      <h2 className="type-h2 text-balance text-smoke">
        {title}
      </h2>
      {description ? (
        <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-stone-400 sm:text-base sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
