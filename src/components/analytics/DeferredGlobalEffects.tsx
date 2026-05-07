"use client";

import { useEffect, useState } from "react";
import { AuroraCursor } from "@/components/effects/AuroraCursor";
import { WixInboxChatWidget } from "@/components/landing/WixInboxChatWidget";

export function DeferredGlobalEffects() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const requestIdle =
      "requestIdleCallback" in globalThis ? globalThis.requestIdleCallback.bind(globalThis) : null;
    const cancelIdle =
      "cancelIdleCallback" in globalThis ? globalThis.cancelIdleCallback.bind(globalThis) : null;

    if (requestIdle && cancelIdle) {
      const idleId = requestIdle(() => setIsReady(true), { timeout: 1500 });
      return () => cancelIdle(idleId);
    }

    const timeoutId = setTimeout(() => setIsReady(true), 700);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!isReady) return null;

  return (
    <>
      <WixInboxChatWidget />
      <AuroraCursor />
    </>
  );
}
