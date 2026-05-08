import Link from "next/link";

interface BlogFinalCtaProps {
  title: string;
  buttonLabel: string;
}

export function BlogFinalCta({ title, buttonLabel }: BlogFinalCtaProps) {
  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-[color:var(--brand)]/25 bg-[color:var(--soft)] p-6 text-[color:var(--ink)] shadow-[0_16px_36px_rgba(10,8,24,0.08)] md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h3 className="max-w-2xl font-display text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h3>
        <Link
          href="/careers"
          className="inline-flex w-fit items-center rounded-full bg-[color:var(--brand)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)]"
        >
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
