"use client";

import { useEffect, useRef } from "react";

const SMOOTHING = 0.12;

export function AuroraCursor() {
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = window.matchMedia("(hover: none)");

    if (reduceMotion.matches || noHover.matches) {
      return;
    }

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
  }, []);

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
