import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface FooterProps {
  locale: Locale;
  showTopBanner?: boolean;
}

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

export function Footer({ locale, showTopBanner = true }: FooterProps) {
  const text = getMessages(locale);

  const aboutLinks: FooterLink[] = [
    { label: text.footer.aboutUs, href: "/about-us" },
    { label: text.footer.careers, href: "/careers", badge: text.footer.hiringBadge },
    { label: text.footer.blogs, href: "/blogs" },
    { label: text.footer.partner, href: "/contact" },
  ];

  return (
    <footer className="relative bg-[color:var(--blob-primary)] text-white">
      <svg
        className="pointer-events-none absolute -top-20 left-0 h-24 w-full text-[color:var(--blob-primary)] md:-top-24 md:h-32"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 48C120 36 240 32 360 40C480 48 600 70 720 68C840 66 960 40 1080 34C1200 28 1320 34 1440 46V160H0V48Z"
        />
      </svg>

      {showTopBanner ? (
        <div className="relative z-10 -mt-px border-b border-white/15">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 pb-10 pt-0 md:flex-row md:items-center md:justify-between md:px-8 md:pt-0">
            <p className="max-w-2xl text-lg font-semibold leading-snug text-white md:text-2xl">
              {text.footer.description}
            </p>
            <Link
              href="/contact"
              className="inline-flex w-fit items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
            >
              {text.footer.contact}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 md:grid-cols-3 md:gap-12 md:px-8">
        <div className="md:pr-8">
          <Image
            src="/favicon-gems.png"
            alt="GEMS United"
            width={64}
            height={64}
            sizes="(max-width: 768px) 56px, 64px"
            className="h-14 w-auto md:h-16 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
          />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/80">
            {text.footer.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:justify-self-center">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {text.footer.about}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-white"
                  >
                    {link.label}
                    {link.badge ? (
                      <span className="whitespace-nowrap rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        {link.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-[160px]">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {text.footer.help}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li>
                <Link href="/contact" className="hover:text-white">
                  {text.footer.contact}
                </Link>
              </li>
              <li>
                <a href={CONTACT_MAILTO} className="hover:text-white">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <span className="text-white/60">Đà Nẵng, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:justify-self-end md:text-right">
          <p className="text-sm leading-7 text-white/80">
            {text.footer.bottomLine1} • Email:{" "}
            <a href={CONTACT_MAILTO} className="hover:text-white">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-1 text-sm leading-7 text-white/80">{text.footer.bottomLine2}</p>
        </div>
      </div>

    </footer>
  );
}
