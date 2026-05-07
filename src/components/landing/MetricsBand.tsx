import { Reveal } from "@/components/motion/Reveal";

export interface MetricItem {
  value: string;
  label: string;
}

interface MetricsBandProps {
  metrics: readonly MetricItem[];
  accent?: "brand" | "accent";
}

export function MetricsBand({ metrics, accent = "brand" }: MetricsBandProps) {
  const gradient =
    accent === "accent"
      ? "linear-gradient(135deg, var(--accent), var(--accent-strong))"
      : "linear-gradient(135deg, var(--brand), var(--brand-light))";

  return (
    <section className="relative overflow-hidden py-14 md:py-20">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[color:var(--brand-soft)]/55 via-[color:var(--surface)] to-[color:var(--accent)]/18"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_55%_at_50%_-10%,rgba(140,82,255,0.18),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55] [background-image:linear-gradient(rgba(111,66,201,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(111,66,201,0.06)_1px,transparent_1px)] [background-size:32px_32px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[color:var(--brand)]/18 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-12 top-1/3 h-72 w-72 rounded-full bg-[color:var(--accent)]/16 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-[color:var(--brand)]/18 bg-[color:var(--surface)] shadow-[0_24px_60px_rgba(111,66,201,0.16)] backdrop-blur-sm md:grid-cols-4">
          {metrics.map((metric, index) => (
            <Reveal key={`${metric.value}-${index}`} delay={index * 0.04}>
              <article className="flex h-full min-h-[150px] flex-col justify-center border-[color:var(--line)] p-6 text-center md:min-h-[180px] md:p-7 [&:not(:nth-child(2n))]:border-r md:[&:not(:last-child)]:border-r md:[&:nth-child(-n+2)]:border-b-0 [&:nth-child(-n+2)]:border-b">
                <p
                  className="font-display text-4xl font-black leading-none tracking-tight md:text-5xl"
                  style={{
                    background: gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {metric.value}
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] md:text-xs">
                  {metric.label}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
