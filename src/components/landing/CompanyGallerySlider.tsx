"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Locale } from "@/i18n/types";
import { withWixImageDelivery } from "@/lib/wix-media";
import type { CompanyImageItem } from "@/types/landing";

export interface CompanyGallerySliderLabels {
  sliderAriaLabel: string;
  prevSlide: string;
  nextSlide: string;
  badge: string;
}

interface CompanyGallerySliderProps {
  items: CompanyImageItem[];
  locale: Locale;
  labels: CompanyGallerySliderLabels;
}

const SWIPE_THRESHOLD = 48;
const VISIBLE_RANGE = 2;
const AUTOPLAY_MS = 5500;

function getDefaultSlideIndex(count: number): number {
  if (count <= 0) return 0;
  return Math.floor(count / 2);
}

function getSlideImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // 16:10 crop at 2x retina headroom; served directly from Wix CDN (no Next re-compress).
  return withWixImageDelivery(url, {
    width: 2400,
    height: 1500,
    quality: 92,
    mode: "fill",
  });
}

function getSlideStyle(index: number, activeIndex: number, reducedMotion: boolean): CSSProperties {
  const base: CSSProperties = {
    left: "50%",
    top: "50%",
    transformOrigin: "center center",
    transition: reducedMotion
      ? "opacity 0.35s ease"
      : "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease, filter 0.45s ease",
  };

  if (reducedMotion) {
    const isActive = index === activeIndex;
    return {
      ...base,
      opacity: isActive ? 1 : 0,
      transform: "translate(-50%, -50%)",
      zIndex: isActive ? 20 : 0,
      pointerEvents: isActive ? "auto" : "none",
    };
  }

  const offset = index - activeIndex;
  if (Math.abs(offset) > VISIBLE_RANGE) {
    return {
      ...base,
      opacity: 0,
      transform: "translate(-50%, -50%) translateX(0) translateZ(-260px) scale(0.55)",
      zIndex: 0,
      pointerEvents: "none",
      filter: "blur(2px)",
    };
  }

  const rotateY = offset * -46;
  const translateX = offset * 54;
  const translateZ = offset === 0 ? 160 : -110 - Math.abs(offset) * 55;
  const scale = offset === 0 ? 1 : 0.74 - Math.abs(offset) * 0.05;
  const opacity = offset === 0 ? 1 : Math.max(0.22, 0.62 - Math.abs(offset) * 0.18);
  const blur = offset === 0 ? 0 : Math.abs(offset) * 0.6;

  return {
    ...base,
    transform: `translate(-50%, -50%) translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
    opacity,
    zIndex: 20 - Math.abs(offset),
    pointerEvents: Math.abs(offset) <= 1 ? "auto" : "none",
    filter: blur > 0 ? `blur(${blur}px)` : undefined,
  };
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M11 4L6 9l5 5" : "M7 4l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CompanyGallerySlider({ items, labels }: CompanyGallerySliderProps) {
  const text = labels;
  const defaultIndex = getDefaultSlideIndex(items.length);
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [stageTilt, setStageTilt] = useState({ x: 0, y: 0 });
  const touchStartX = useRef<number | null>(null);
  const boothRef = useRef<HTMLDivElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);

  const slideCount = items.length;
  const activeItem = items[activeIndex];
  const enable3D = mounted && !prefersReducedMotion;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (slideCount === 0) return;
      const next = ((index % slideCount) + slideCount) % slideCount;
      setActiveIndex(next);
    },
    [slideCount],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!mounted || slideCount <= 1 || isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, mounted, prefersReducedMotion, slideCount]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enable3D || !boothRef.current) return;
    const bounds = boothRef.current.getBoundingClientRect();
    const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const normalizedY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    setStageTilt({ x: normalizedX * 5, y: normalizedY * -4 });
  };

  const onPointerLeave = () => setStageTilt({ x: 0, y: 0 });

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(slideCount - 1);
    }
  };

  if (!activeItem) return null;

  const stageTiltTransform = enable3D
    ? `rotateX(${stageTilt.y}deg) rotateY(${stageTilt.x}deg)`
    : undefined;

  return (
    <div
      ref={regionRef}
      className="group/gallery relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={text.sliderAriaLabel}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (regionRef.current?.contains(event.relatedTarget as Node | null)) return;
        setIsPaused(false);
      }}
      tabIndex={0}
    >
      <div
        ref={boothRef}
        className="projector-booth relative overflow-hidden rounded-[32px] border border-[color:var(--brand)]/30 shadow-[0_28px_60px_-20px_rgba(25,12,52,0.45),0_12px_28px_-14px_rgba(111,66,201,0.25)]"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2a1a4a] via-[#150f28] to-[#0a0618]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.9)_0.6px,transparent_0.6px)] [background-size:3px_3px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[62%] bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(140,82,255,0.42),rgba(126,217,87,0.08)_38%,transparent_72%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-full w-[min(72vw,560px)] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_125deg,rgba(255,255,255,0.07)_180deg,transparent_235deg)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.55)_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 px-3 pt-3 md:px-6 md:pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm md:px-3 md:py-1 md:text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_8px_rgba(126,217,87,0.8)]" />
            {text.badge}
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-3 pb-5 md:px-8 md:pb-6">
          <div className="relative h-[clamp(320px,52vh,480px)] w-full [perspective:1400px] [perspective-origin:50%_46%] md:h-[clamp(360px,56vh,520px)]">
          <div
            className="absolute inset-0 transition-transform duration-500 ease-out motion-reduce:transition-none [transform-style:preserve-3d]"
            style={{ transform: stageTiltTransform }}
          >
            {items.map((item, index) => {
              const imageUrl = getSlideImageUrl(item.imageUrl);
              const isActive = index === activeIndex;
              const offset = index - activeIndex;
              const slideStyle = getSlideStyle(index, activeIndex, !enable3D);

              return (
                <article
                  key={item.id}
                  aria-hidden={!isActive}
                  aria-current={isActive ? "true" : undefined}
                  className={[
                    "absolute w-[min(92vw,640px)] cursor-pointer md:w-[min(84vw,720px)]",
                    !isActive && Math.abs(offset) === 1 ? "hover:opacity-90" : "",
                  ].join(" ")}
                  style={slideStyle}
                  onClick={() => {
                    if (!isActive) goTo(index);
                  }}
                >
                  <div className="relative w-full overflow-hidden rounded-2xl border border-white/20 bg-[#0c0820] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    <div className="relative w-full pb-[62.5%]">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          fill
                          unoptimized
                          priority={index === defaultIndex}
                          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 84vw, 1280px"
                          className={`object-cover ${isActive && enable3D ? "design-hero-img" : ""}`}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[color:var(--brand)] via-[color:var(--brand-light)] to-[color:var(--brand-strong)]">
                          <span className="font-display text-5xl font-black text-white/90 md:text-6xl">
                            {item.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_28%,transparent_72%,rgba(0,0,0,0.18)_100%)]"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {slideCount > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label={text.prevSlide}
                className="absolute left-0 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-[color:var(--brand-light)] hover:bg-[color:var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-light)] md:h-10 md:w-10"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={text.nextSlide}
                className="absolute right-0 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-[color:var(--brand-light)] hover:bg-[color:var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-light)] md:h-10 md:w-10"
              >
                <ChevronIcon direction="right" />
              </button>
            </>
          ) : null}

            <div
              className="pointer-events-none absolute -bottom-3 left-1/2 z-20 flex h-9 w-24 -translate-x-1/2 items-end justify-center md:-bottom-4 md:h-10 md:w-28"
              aria-hidden="true"
            >
              <div className="absolute bottom-0 h-2 w-full rounded-full bg-gradient-to-b from-[#3d2a66] to-[#1a1230]" />
              <div className="absolute bottom-1 h-5 w-5 rounded-full bg-gradient-to-br from-[color:var(--accent)] via-[#b388ff] to-[color:var(--brand)] shadow-[0_0_18px_rgba(126,217,87,0.5),0_0_32px_rgba(140,82,255,0.3)] md:h-6 md:w-6" />
            </div>
          </div>
        </div>

        <div className="h-5 md:h-6" aria-hidden="true" />
      </div>
    </div>
  );
}
