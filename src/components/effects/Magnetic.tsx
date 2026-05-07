"use client";

import { useEffect, useRef } from "react";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  maxOffset?: number;
}

export function Magnetic({ children, className, radius = 120, maxOffset = 8 }: MagneticProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const onPointerMove = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      const centerX = bounds.left + bounds.width * 0.5;
      const centerY = bounds.top + bounds.height * 0.5;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > radius) {
        targetRef.current.x = 0;
        targetRef.current.y = 0;
        return;
      }

      const strength = 1 - distance / radius;
      targetRef.current.x = (deltaX / radius) * maxOffset * strength;
      targetRef.current.y = (deltaY / radius) * maxOffset * strength;
    };

    const onPointerLeave = () => {
      targetRef.current.x = 0;
      targetRef.current.y = 0;
      element.style.transition = "transform 400ms ease-out";
      window.setTimeout(() => {
        element.style.transition = "";
      }, 420);
    };

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.18;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.18;
      element.style.transform = `translate3d(${currentRef.current.x.toFixed(2)}px, ${currentRef.current.y.toFixed(2)}px, 0)`;
      frameRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    element.addEventListener("pointerleave", onPointerLeave, { passive: true });
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [maxOffset, radius]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
