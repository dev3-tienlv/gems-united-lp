import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// Map collection keywords → cache tags + paths to revalidate
const COLLECTION_MAP: Record<string, { tags: string[]; paths: string[] }> = {
  career: { tags: ["wix-careers"], paths: ["/", "/careers"] },
  blog: { tags: ["wix-blogs"], paths: ["/", "/blogs"] },
  design: { tags: ["wix-designs"], paths: ["/"] },
};

const ALL_TAGS = ["wix-careers", "wix-blogs", "wix-designs"];
const ALL_PATHS = ["/", "/careers"];

function resolveScope(payload: Record<string, unknown>) {
  const id = [payload.collectionId, payload.collection_id, payload.dataCollectionId]
    .find((v) => typeof v === "string") as string | undefined;

  if (!id) return { tags: ALL_TAGS, paths: ALL_PATHS };

  const lower = id.toLowerCase();
  const match = Object.entries(COLLECTION_MAP).find(([key]) => lower.includes(key));
  return match ? match[1] : { tags: ALL_TAGS, paths: ALL_PATHS };
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret) {
    return NextResponse.json({ error: "REVALIDATE_SECRET not configured" }, { status: 500 });
  }
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    // payload is optional — revalidate everything if body is missing
  }

  const { tags, paths } = resolveScope(payload);

  for (const tag of tags) revalidateTag(tag, "max");
  for (const path of paths) revalidatePath(path, "layout");

  return NextResponse.json({
    revalidated: true,
    tags,
    paths,
    timestamp: new Date().toISOString(),
  });
}

// Convenience GET for manual testing: /api/revalidate?secret=xxx
export async function GET(request: Request) {
  return POST(request);
}
