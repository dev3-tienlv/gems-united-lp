interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}

export function SectionTitle({ eyebrow, title, description, align = "center" }: SectionTitleProps) {
  return (
    <header className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl font-extrabold leading-tight text-[color:var(--ink)] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-[color:var(--muted)] md:text-[17px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
