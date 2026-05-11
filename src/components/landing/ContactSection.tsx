import { MapFacade } from "@/components/landing/MapFacade";
import { Reveal } from "@/components/motion/Reveal";
import { CONTACT_EMAIL, CONTACT_MAILTO, FACEBOOK_URL } from "@/lib/constants";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface ContactSectionProps {
  id?: string;
  sectionClassName?: string;
  locale: Locale;
}

/** Same place as Google Maps: camera @16.0406515,108.2171682; marker @16.0405426,108.2173066. */
const OPEN_IN_MAPS_URL =
  "https://www.google.com/maps/@16.0406515,108.2171682,18z/data=!4m6!3m5!1s0x31421924f8ccca8d:0xf95f058f7ebf9e24!8m2!3d16.0405426!4d108.2173066!16s%2Fg%2F11wnzpk9y9?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D";

/** `q=` makes embed show the red pin; `ll=` alone often centers without a marker. */
const MAP_SRC =
  "https://www.google.com/maps?q=16.0405426,108.2173066&z=18&t=m&output=embed";

export function ContactSection({
  id = "contact",
  sectionClassName = "bg-[color:var(--surface)] py-20 md:py-28",
  locale,
}: ContactSectionProps) {
  const text = getMessages(locale);
  return (
    <section id={id} className={sectionClassName}>
      <div className="mx-auto grid w-full max-w-[1320px] gap-12 px-5 md:grid-cols-[0.85fr_1.15fr] md:px-8">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
            {text.contact.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-[color:var(--ink)] md:text-4xl">
            {text.contact.title}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-[color:var(--muted)]">
            {text.contact.description}
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="overflow-hidden rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_30px_80px_rgba(10,8,24,0.10)]">
            <MapFacade
              src={MAP_SRC}
              title={text.contact.mapTitle}
              className="h-[280px] w-full border-0"
              openInMapsUrl={OPEN_IN_MAPS_URL}
              openInMapsLabel="Open in Maps"
            />
            <div className="space-y-3 p-6 md:p-7">
              <h3 className="font-display text-3xl font-extrabold text-[color:var(--brand)]">
                {text.contact.welcome}
              </h3>
              <p className="text-sm text-[color:var(--ink-2)]">
                {text.contact.address}
              </p>
              <p className="text-sm text-[color:var(--ink-2)]">
                {text.contact.email}:{" "}
                <a className="font-semibold text-[color:var(--brand)] hover:underline" href={CONTACT_MAILTO}>
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="text-sm text-[color:var(--ink-2)]">
                {text.contact.facebook}:{" "}
                <a
                  className="font-semibold text-[color:var(--brand)] hover:underline"
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  facebook.com/gemsutd
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
