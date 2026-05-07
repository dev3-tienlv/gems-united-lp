import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gemsunited.com";
const canonicalUrl = new URL(SITE_URL);
const canonicalHost = canonicalUrl.host;
const canonicalProtocol = canonicalUrl.protocol;

function isSkippablePath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

export function proxy(request: NextRequest) {
  const { nextUrl, headers } = request;
  const pathname = nextUrl.pathname;

  if (isSkippablePath(pathname)) {
    return NextResponse.next();
  }

  const isLocalhost =
    nextUrl.hostname === "localhost" ||
    nextUrl.hostname === "127.0.0.1" ||
    nextUrl.hostname === "[::1]";
  if (isLocalhost) {
    return NextResponse.next();
  }

  const forwardedProto = headers.get("x-forwarded-proto");
  const currentProtocol = forwardedProto ? `${forwardedProto}:` : nextUrl.protocol;
  const hasTrailingSlash = pathname.length > 1 && pathname.endsWith("/");
  const hostChanged = nextUrl.host !== canonicalHost;
  const protocolChanged = currentProtocol !== canonicalProtocol;

  if (!hostChanged && !protocolChanged && !hasTrailingSlash) {
    return NextResponse.next();
  }

  const redirectUrl = nextUrl.clone();
  redirectUrl.protocol = canonicalProtocol;
  redirectUrl.host = canonicalHost;
  if (hasTrailingSlash) {
    redirectUrl.pathname = pathname.slice(0, -1);
  }

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
