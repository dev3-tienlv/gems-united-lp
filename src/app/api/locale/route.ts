import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/i18n/locale";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const MAX_BODY_BYTES = 256;

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let body: { locale?: unknown };
  try {
    body = text ? (JSON.parse(text) as { locale?: unknown }) : {};
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (typeof body.locale !== "string" || !isLocale(body.locale)) {
    return NextResponse.json({ ok: false, error: "invalid_locale" }, { status: 400 });
  }

  const store = await cookies();
  store.set(LOCALE_COOKIE, body.locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    maxAge: ONE_YEAR_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
