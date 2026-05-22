"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  DEFAULT_LIME,
  DEFAULT_PURPLE,
  SparkDecoMark,
  TitleDecoMark,
} from "@/components/effects/HeroDecoMarks";

type MotionState = {
  rotateX: number;
  rotateY: number;
  shiftX: number;
  shiftY: number;
  glowX: number;
  glowY: number;
  scale: number;
};

const INITIAL_MOTION: MotionState = {
  rotateX: 0,
  rotateY: 0,
  shiftX: 0,
  shiftY: 0,
  glowX: 50,
  glowY: 45,
  scale: 1,
};

interface Interactive3DVisualProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  /** Tailwind sizing for the inner perspective box, e.g. "h-[380px] w-[380px] md:h-[460px] md:w-[460px]". */
  containerClassName: string;
  /** Extra Tailwind classes for the image (e.g. drop-shadow). */
  imageClassName?: string;
  /** Render the soft brand/accent corner dots. */
  showCornerAccents?: boolean;
  /** Larger title-deco mark at top-right (hero). */
  showTopRightAccent?: boolean;
  /** Mark the image as high-priority (above the fold). Defaults to lazy. */
  priority?: boolean;
}

export function Interactive3DVisual({
  src,
  alt,
  width,
  height,
  sizes,
  containerClassName,
  imageClassName = "",
  showCornerAccents = false,
  showTopRightAccent = false,
  priority = false,
}: Interactive3DVisualProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const target: MotionState = { ...INITIAL_MOTION };
    const current: MotionState = { ...INITIAL_MOTION };

    const applyMotion = (state: MotionState) => {
      if (visualRef.current) {
        visualRef.current.style.transform = `translate3d(${state.shiftX.toFixed(2)}px, ${state.shiftY.toFixed(2)}px, 0) rotateX(${state.rotateX.toFixed(2)}deg) rotateY(${state.rotateY.toFixed(2)}deg) scale(${state.scale.toFixed(3)})`;
      }
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(circle at ${state.glowX.toFixed(2)}% ${state.glowY.toFixed(2)}%, rgba(126,217,87,0.34), rgba(111,66,201,0.16) 45%, transparent 70%)`;
      }
    };

    const tick = () => {
      current.rotateX += (target.rotateX - current.rotateX) * 0.08;
      current.rotateY += (target.rotateY - current.rotateY) * 0.08;
      current.shiftX += (target.shiftX - current.shiftX) * 0.1;
      current.shiftY += (target.shiftY - current.shiftY) * 0.1;
      current.glowX += (target.glowX - current.glowX) * 0.1;
      current.glowY += (target.glowY - current.glowY) * 0.1;
      current.scale += (target.scale - current.scale) * 0.08;

      applyMotion(current);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = card.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width;
      const relativeY = (event.clientY - bounds.top) / bounds.height;
      const normalizedX = relativeX * 2 - 1;
      const normalizedY = relativeY * 2 - 1;

      target.rotateX = -normalizedY * 12;
      target.rotateY = normalizedX * 14;
      target.shiftX = normalizedX * 14;
      target.shiftY = normalizedY * 10;
      target.glowX = 50 + normalizedX * 20;
      target.glowY = 45 + normalizedY * 14;
      target.scale = 1.02;
    };

    const onPointerLeave = () => {
      target.rotateX = 0;
      target.rotateY = 0;
      target.shiftX = 0;
      target.shiftY = 0;
      target.glowX = 50;
      target.glowY = 45;
      target.scale = 1;
    };

    applyMotion(INITIAL_MOTION);
    frameRef.current = window.requestAnimationFrame(tick);
    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      card.removeEventListener("pointermove", onPointerMove);
      card.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="relative overflow-visible">
      {showTopRightAccent ? (
        <TitleDecoMark
          stroke={DEFAULT_PURPLE}
          strokeOpacity={0.82}
          className="pointer-events-none absolute -right-3 -top-3 z-[1] h-24 w-24 md:-right-4 md:-top-4 md:h-28 md:w-28"
        />
      ) : null}
      {showCornerAccents ? (
        <>
          <SparkDecoMark
            stroke={DEFAULT_PURPLE}
            strokeOpacity={0.82}
            className="pointer-events-none absolute -left-6 -top-6 z-[1] h-24 w-24 md:-left-8 md:-top-8 md:h-28 md:w-28"
          />
          <TitleDecoMark
            stroke={DEFAULT_LIME}
            strokeOpacity={0.82}
            className="pointer-events-none absolute -bottom-5 -right-5 z-[1] h-24 w-24 md:-bottom-6 md:-right-6 md:h-28 md:w-28"
          />
        </>
      ) : null}

      <div ref={cardRef} className="relative z-[2] animate-float-gentle [perspective:1200px]">
        <div
          ref={glowRef}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-opacity duration-500"
        />
        <div
          ref={visualRef}
          className={`relative ${containerClassName} [transform:translate3d(0,0,0)] will-change-transform`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            fetchPriority={priority ? "high" : "auto"}
            sizes={sizes}
            className={`h-full w-full object-contain ${imageClassName}`}
          />
        </div>
      </div>
    </div>
  );
}
