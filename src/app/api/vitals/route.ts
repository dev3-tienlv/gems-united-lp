import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 2048;
const ALLOWED_NAMES = new Set(["LCP", "CLS", "INP"]);

interface VitalsPayload {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  pathname: string;
}

function getGa4Config() {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return null;
  return { measurementId, apiSecret };
}

function toGa4Payload(metric: VitalsPayload) {
  return {
    client_id: metric.id,
    events: [
      {
        name: "web_vital",
        params: {
          metric_name: metric.name,
          metric_value: Number(metric.value.toFixed(2)),
          metric_delta: Number(metric.delta.toFixed(2)),
          metric_rating: metric.rating,
          page_path: metric.pathname,
          engagement_time_msec: 1,
        },
      },
    ],
  };
}

async function sendToGa4(metric: VitalsPayload): Promise<void> {
  const config = getGa4Config();
  if (!config) return;

  const endpoint =
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(config.measurementId)}` +
    `&api_secret=${encodeURIComponent(config.apiSecret)}`;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toGa4Payload(metric)),
      cache: "no-store",
    });
  } catch {
    // Ignore transport errors to keep vitals endpoint non-blocking.
  }
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function isValidPayload(payload: unknown): payload is VitalsPayload {
  if (!payload || typeof payload !== "object") return false;
  const body = payload as Partial<VitalsPayload>;

  return (
    typeof body.id === "string" &&
    typeof body.name === "string" &&
    ALLOWED_NAMES.has(body.name) &&
    typeof body.value === "number" &&
    Number.isFinite(body.value) &&
    typeof body.delta === "number" &&
    Number.isFinite(body.delta) &&
    (body.rating === "good" || body.rating === "needs-improvement" || body.rating === "poor") &&
    typeof body.pathname === "string"
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!isValidPayload(payload)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  await sendToGa4(payload);

  if (process.env.VITALS_LOG_STDOUT === "1") {
    process.stdout.write(`[web-vitals] ${JSON.stringify(payload)}\n`);
  }
  return NextResponse.json({ ok: true });
}
