import { NextResponse } from "next/server";
import { DEFAULT_WIX_SITE_ID } from "@/lib/constants";

const WIX_INBOX_API_BASE = "https://www.wixapis.com/inbox/v2";
const MAX_MESSAGE_LENGTH = 1000;

interface ChatPayload {
  message?: string;
  anonymousVisitorId?: string;
}

function getAuthConfig() {
  return {
    apiToken: process.env.WIX_INBOX_API_TOKEN || process.env.WIX_HEADLESS_API_KEY,
    siteId: process.env.WIX_HEADLESS_SITE_ID || DEFAULT_WIX_SITE_ID,
  };
}

function sanitizeMessage(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, MAX_MESSAGE_LENGTH);
}

function sanitizeVisitorId(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  return /^[a-zA-Z0-9-]{8,64}$/.test(trimmed) ? trimmed : "";
}

async function getOrCreateConversation(apiToken: string, siteId: string, anonymousVisitorId: string) {
  const response = await fetch(`${WIX_INBOX_API_BASE}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiToken,
      "wix-site-id": siteId,
    },
    body: JSON.stringify({
      participantId: {
        anonymousVisitorId,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`getOrCreateConversation failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as { conversation?: { id?: string } };
  const conversationId = data.conversation?.id;
  if (!conversationId) {
    throw new Error("Missing conversationId in Wix response.");
  }
  return conversationId;
}

async function sendParticipantMessage(
  apiToken: string,
  siteId: string,
  conversationId: string,
  message: string,
) {
  const response = await fetch(`${WIX_INBOX_API_BASE}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiToken,
      "wix-site-id": siteId,
    },
    body: JSON.stringify({
      conversationId,
      sendNotifications: true,
      sendAs: "PARTICIPANT",
      message: {
        direction: "PARTICIPANT_TO_BUSINESS",
        visibility: "BUSINESS_AND_PARTICIPANT",
        targetChannelIds: ["CHAT"],
        content: {
          previewText: message.slice(0, 140),
          basic: {
            items: [{ text: message }],
          },
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`sendMessage failed (${response.status}): ${detail}`);
  }
}

export async function POST(request: Request) {
  const { apiToken, siteId } = getAuthConfig();
  if (!apiToken) {
    return NextResponse.json(
      { ok: false, error: "WIX_INBOX_API_TOKEN is missing." },
      { status: 500 },
    );
  }

  let payload: ChatPayload = {};
  try {
    payload = (await request.json()) as ChatPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const message = sanitizeMessage(payload.message);
  const anonymousVisitorId = sanitizeVisitorId(payload.anonymousVisitorId);

  if (!message) {
    return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });
  }
  if (!anonymousVisitorId) {
    return NextResponse.json(
      { ok: false, error: "anonymousVisitorId is required." },
      { status: 400 },
    );
  }

  try {
    const conversationId = await getOrCreateConversation(apiToken, siteId, anonymousVisitorId);
    await sendParticipantMessage(apiToken, siteId, conversationId, message);
    return NextResponse.json({ ok: true, conversationId });
  } catch (error) {
    console.error("[wix-chat] Failed to send participant message:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to send message to Wix Inbox." },
      { status: 502 },
    );
  }
}
