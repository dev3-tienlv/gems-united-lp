import { NextResponse } from "next/server";
import { getWixEnv, listCollections } from "@/lib/wix-headless";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeCollections = url.searchParams.get("collections") === "1";
  const availableCollections = includeCollections ? await listCollections() : undefined;
  const env = getWixEnv();

  return NextResponse.json({
    connected: Boolean(env.apiKey),
    siteId: env.siteId,
    careersCollectionId: env.careersCollectionId || null,
    blogsCollectionId: env.blogsCollectionId || null,
    ...(includeCollections ? { availableCollections } : {}),
  });
}
