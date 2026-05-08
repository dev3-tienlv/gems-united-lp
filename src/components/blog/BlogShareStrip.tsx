"use client";

import { useEffect, useState } from "react";

interface BlogShareStripProps {
  url: string;
  title: string;
  shareLabel: string;
  copyLabel: string;
  copiedLabel: string;
}

const COPIED_TIMEOUT_MS = 1500;

const ICON_CLASS = "h-4 w-4";

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={ICON_CLASS}
    >
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.87.24-1.46 1.49-1.46H17V4.5c-.27-.04-1.18-.12-2.24-.12-2.22 0-3.74 1.36-3.74 3.85V10.5H8.5v3H11V21z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={ICON_CLASS}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.834L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={ICON_CLASS}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

async function copyToClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // fall through to legacy approach
    }
  }

  if (typeof document === "undefined") return false;
  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}

export function BlogShareStrip({
  url,
  title,
  shareLabel,
  copyLabel,
  copiedLabel,
}: BlogShareStripProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const xUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), COPIED_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [copied]);

  const onCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) setCopied(true);
  };

  const buttonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--ink)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)]";

  return (
    <div role="group" aria-label={shareLabel} className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {shareLabel}
      </span>
      <div className="flex items-center gap-2">
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className={buttonClass}
        >
          <FacebookIcon />
        </a>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className={buttonClass}
        >
          <XIcon />
        </a>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copyLabel}
          aria-live="polite"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 text-xs font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)]"
        >
          <CopyIcon />
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}
