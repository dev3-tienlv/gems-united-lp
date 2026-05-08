"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const STORAGE_KEY = "wix-inbox-anonymous-visitor-id";

type SendState = "idle" | "sending" | "sent" | "error";
type MessageRole = "incoming" | "outgoing";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "incoming",
    text: "Hi there. Welcome to GEMS United. Let us know if you have any questions.",
  },
  {
    id: "welcome-2",
    role: "incoming",
    text: "If you need support, feel free to message us here. Our team will reply soon.",
  },
];

function createVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const next = createVisitorId();
  window.localStorage.setItem(STORAGE_KEY, next);
  return next;
}

export function WixInboxChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [helperText, setHelperText] = useState("Chat with GEMS United team.");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const canSubmit = useMemo(
    () => message.trim().length > 0 && sendState !== "sending",
    [message, sendState],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = message.trim();
    if (!cleaned || sendState === "sending") return;

    setMessages((prev) => [
      ...prev,
      {
        id: `outgoing-${Date.now()}`,
        role: "outgoing",
        text: cleaned,
      },
    ]);
    setMessage("");
    setSendState("sending");
    setHelperText("Sending...");

    try {
      const visitorId = getVisitorId();
      const response = await fetch("/api/wix-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleaned,
          anonymousVisitorId: visitorId,
        }),
      });

      if (!response.ok) {
        throw new Error("Send failed");
      }

      setSendState("sent");
      setHelperText("Sent. Team will reply soon.");
    } catch {
      setSendState("error");
      setHelperText("Send failed. Please try again.");
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[min(92vw,368px)] overflow-hidden rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface-glass)] shadow-[0_20px_40px_rgba(14,20,31,0.24),0_2px_8px_rgba(14,20,31,0.14)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3 border-b border-[color:var(--line)] bg-[linear-gradient(120deg,color-mix(in_srgb,var(--brand)_14%,var(--surface)),var(--surface))] px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--fg)]">GEMS UNITED</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active now
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
              }}
              className="cursor-pointer rounded-full border border-[color:var(--line)] bg-[color:color-mix(in_srgb,var(--surface)_70%,transparent)] px-2.5 py-1 text-xs text-[color:var(--fg)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--brand)]"
              aria-label="Close chat"
            >
              Close
            </button>
          </div>

          <div className="space-y-3 bg-[color:color-mix(in_srgb,var(--surface)_55%,transparent)] px-4 py-4">
            <div className="mx-auto w-fit rounded-full bg-[color:color-mix(in_srgb,var(--fg)_10%,transparent)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[color:var(--muted)]">
              Today
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto px-2 pb-7">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.role === "outgoing"
                      ? "ml-8 rounded-2xl rounded-br-md bg-gradient-to-br from-[color:var(--brand)] to-[color:color-mix(in_srgb,var(--brand)_72%,#000)] px-3 py-2 text-sm text-white shadow-[0_8px_18px_color-mix(in_srgb,var(--brand)_35%,transparent)]"
                      : "mr-8 rounded-2xl rounded-bl-md border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--fg)]"
                  }
                >
                  {item.text}
                </div>
              ))}
            </div>
            <p className="text-xs text-[color:var(--muted)]">{helperText}</p>
          </div>

          <form onSubmit={onSubmit} className="border-t border-[color:var(--line)] bg-[color:color-mix(in_srgb,var(--surface)_60%,transparent)] p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-2 backdrop-blur">
              <textarea
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  if (sendState !== "idle") setSendState("idle");
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Write your message..."
                rows={2}
                maxLength={1000}
                className="min-h-[48px] flex-1 resize-none bg-transparent px-1 py-1 text-sm text-[color:var(--fg)] outline-none placeholder:text-[color:var(--muted)]"
              />
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[color:var(--brand)] text-xs font-bold text-white shadow-[0_8px_18px_color-mix(in_srgb,var(--brand)_36%,transparent)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                ↗
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
            className="relative inline-flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/30 bg-[radial-gradient(circle_at_30%_25%,color-mix(in_srgb,var(--brand)_84%,white),color-mix(in_srgb,var(--brand)_92%,#000))] text-white shadow-[0_12px_28px_color-mix(in_srgb,var(--brand)_38%,transparent)] transition hover:scale-[1.03] hover:brightness-105"
            aria-label="Open chat"
          >
            <Image
              src="/logo-3d.png"
              alt="GEMS United logo"
              width={42}
              height={42}
              loading="eager"
              className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
            />
          </button>
        </div>
      )}
    </div>
  );
}
