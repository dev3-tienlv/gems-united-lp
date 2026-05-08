"use client";

import { useEffect, useRef } from "react";

export function BlogReadingProgress() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const root = document.documentElement;
      const total = root.scrollHeight - root.clientHeight;
      const ratio = total > 0 ? Math.min(1, Math.max(0, root.scrollTop / total)) : 0;
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${ratio})`;
      }
    };

    const onScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-[3px] bg-transparent"
    >
      <div
        ref={fillRef}
        className="h-full origin-left bg-[color:var(--brand)] will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
