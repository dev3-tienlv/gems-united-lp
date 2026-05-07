"use client";

import { useState } from "react";
import { BrandLoader } from "@/components/loader/BrandLoader";

export function LoadingPreviewClient() {
  const [version, setVersion] = useState(0);
  const replay = () => setVersion((v) => v + 1);

  return (
    <div className="relative">
      <BrandLoader key={version} />
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
        <button
          type="button"
          onClick={replay}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-glass)] px-5 py-2.5 text-sm font-semibold text-[color:var(--ink)] shadow-[0_18px_40px_rgba(10,8,24,0.16)] backdrop-blur transition hover:bg-[color:var(--soft)]"
          aria-label="Replay loading animation"
        >
          <ReplayIcon />
          Replay
        </button>
      </div>
    </div>
  );
}

function ReplayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12a9 9 0 1 0 3.5-7.13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M3 4v5h5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
