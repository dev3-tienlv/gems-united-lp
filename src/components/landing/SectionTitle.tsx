interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  maxWidth?: "3xl" | "4xl" | "5xl";
  titleClassName?: string;
}

const maxWidthClassMap: Record<NonNullable<SectionTitleProps["maxWidth"]>, string> = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
  maxWidth = "3xl",
  titleClassName,
}: SectionTitleProps) {
  const maxWidthClass = maxWidthClassMap[maxWidth];
  return (
    <header className={align === "center" ? `mx-auto ${maxWidthClass} text-center` : maxWidthClass}>
      {eyebrow ? (
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={[
          "text-balance font-display text-3xl font-extrabold leading-tight text-[color:var(--ink)] md:text-4xl",
          titleClassName ?? "",
        ].join(" ")}
      >
        {title}
      </h2>
      {description ? (
        <p className="text-balance mt-4 text-base leading-7 text-[color:var(--muted)] md:text-[17px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
