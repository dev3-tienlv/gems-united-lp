import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface FooterProps {
  locale: Locale;
}

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

export function Footer({ locale }: FooterProps) {
  const text = getMessages(locale);

  const aboutLinks: FooterLink[] = [
    { label: text.footer.aboutUs, href: "/about-us" },
    { label: text.footer.careers, href: "/careers", badge: text.footer.hiringBadge },
    { label: text.footer.blogs, href: "/blogs" },
    { label: text.footer.partner, href: "/contact" },
  ];

  return (
    <footer className="bg-[color:var(--brand)] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 md:gap-12 md:px-8">
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

      <div className="border-t border-white/10 py-4 text-center text-[11px] text-white/60" />
    </footer>
  );
}
