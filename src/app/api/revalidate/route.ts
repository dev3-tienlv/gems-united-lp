import { NextRequest, NextResponse } from "next/server";
import {
  ALL_WIX_CACHE_TAGS,
  type WixCacheTag,
  isWixCacheTag,
  revalidateWixContent,
} from "@/lib/wix-cache";

function getSecret(request: NextRequest, body: Record<string, unknown>): string | null {
  const fromQuery = request.nextUrl.searchParams.get("secret");
  if (fromQuery) return fromQuery;
  if (typeof body.secret === "string") return body.secret;
  return request.headers.get("x-revalidate-secret");
}

function resolveTags(body: Record<string, unknown>): WixCacheTag[] {
  if (body.all === true || body.type === "all") {
    return ALL_WIX_CACHE_TAGS;
  }
  const raw = body.tags;
  if (!Array.isArray(raw)) return ALL_WIX_CACHE_TAGS;
  const tags = raw.filter((t): t is WixCacheTag => typeof t === "string" && isWixCacheTag(t));
  return tags.length > 0 ? tags : ALL_WIX_CACHE_TAGS;
}

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET is not configured" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const secret = getSecret(request, body);
  if (secret !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const tags = resolveTags(body);
  revalidateWixContent(tags);

  return NextResponse.json({
    ok: true,
    revalidated: tags,
    at: new Date().toISOString(),
  });
}
