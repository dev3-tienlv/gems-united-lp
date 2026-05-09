"use client";

import { useEffect, useRef, useState } from "react";

const SMOOTHING = 0.12;
/** Tailwind `md` width + real hover (mouse): hides on phones and coarse pointer layouts. */
const DESKTOP_CURSOR_MEDIA = "(min-width: 768px) and (hover: hover)";

export function AuroraCursor() {
  const frameRef = useRef<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const desktopMq = window.matchMedia(DESKTOP_CURSOR_MEDIA);
    const reduceMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setShowOverlay(desktopMq.matches && !reduceMotionMq.matches);
    };

    sync();
    desktopMq.addEventListener("change", sync);
    reduceMotionMq.addEventListener("change", sync);

    return () => {
      desktopMq.removeEventListener("change", sync);
      reduceMotionMq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!showOverlay || typeof window === "undefined") return;

    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.35;
    let currentX = mouseX;
    let currentY = mouseY;

    const root = document.documentElement;
    root.style.setProperty("--mx", `${currentX.toFixed(2)}px`);
    root.style.setProperty("--my", `${currentY.toFixed(2)}px`);

    const onPointerMove = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const tick = () => {
      currentX += (mouseX - currentX) * SMOOTHING;
      currentY += (mouseY - currentY) * SMOOTHING;

      root.style.setProperty("--mx", `${currentX.toFixed(2)}px`);
      root.style.setProperty("--my", `${currentY.toFixed(2)}px`);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("pointermove", onPointerMove);
      root.style.removeProperty("--mx");
      root.style.removeProperty("--my");
    };
  }, [showOverlay]);

  if (!showOverlay) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-70 mix-blend-normal dark:mix-blend-plus-lighter"
      style={{
        background:
          "radial-gradient(8rem 8rem at var(--mx, 50vw) var(--my, 35vh), var(--cursor-from), var(--cursor-to) 42%, transparent 68%)",
      }}
    />
  );
}
