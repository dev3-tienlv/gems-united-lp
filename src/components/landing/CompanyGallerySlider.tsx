"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { WinterOrnament } from "@/components/xmas/WinterPageDecor";
import type { Locale } from "@/i18n/types";
import { withWixImageDelivery } from "@/lib/wix-media";
import type { CompanyImageItem } from "@/types/landing";

export interface CompanyGallerySliderLabels {
  sliderAriaLabel: string;
  prevSlide: string;
  nextSlide: string;
  goToSlide: string;
  badge: string;
}

interface CompanyGallerySliderProps {
  items: CompanyImageItem[];
  locale: Locale;
  labels: CompanyGallerySliderLabels;
}

interface ScrollParallax {
  imageTranslateY: number;
  glowTranslateY: number;
  frameTranslateY: number;
}

interface PointerParallax {
  x: number;
  y: number;
}

const SWIPE_THRESHOLD = 48;
const AUTOPLAY_MS = 6000;
const DEFAULT_SCROLL_PARALLAX: ScrollParallax = {
  imageTranslateY: 0,
  glowTranslateY: 0,
  frameTranslateY: 0,
};

function getDefaultSlideIndex(count: number): number {
  if (count <= 0) return 0;
  return Math.floor(count / 2);
}

function getHeroImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return withWixImageDelivery(url, {
    width: 3840,
    quality: 100,
    mode: "fit",
  });
}

function getThumbImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return withWixImageDelivery(url, {
    width: 480,
    height: 300,
    quality: 90,
    mode: "fill",
  });
}

function useScrollParallax(
  ref: React.RefObject<HTMLElement | null>,
  disabled: boolean,
): ScrollParallax {
  const [parallax, setParallax] = useState<ScrollParallax>(DEFAULT_SCROLL_PARALLAX);

  useEffect(() => {
    if (disabled) return;

    const update = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isVisible = rect.bottom > 0 && rect.top < viewportHeight;
      if (!isVisible) {
        setParallax(DEFAULT_SCROLL_PARALLAX);
        return;
      }

      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distanceFromCenter = (sectionCenter - viewportCenter) / viewportHeight;

      setParallax({
        imageTranslateY: distanceFromCenter * -42,
        glowTranslateY: distanceFromCenter * 28,
        frameTranslateY: distanceFromCenter * 14,
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [disabled, ref]);

  return disabled ? DEFAULT_SCROLL_PARALLAX : parallax;
}

function usePointerParallax(ref: React.RefObject<HTMLElement | null>, disabled: boolean) {
  const [offset, setOffset] = useState<PointerParallax>({ x: 0, y: 0 });

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled || !ref.current) return;
      const bounds = ref.current.getBoundingClientRect();
      const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const normalizedY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      setOffset({ x: normalizedX * 10, y: normalizedY * -8 });
    },
    [disabled, ref],
  );

  const onPointerLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return { offset, onPointerMove, onPointerLeave };
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

interface SlideImageProps {
  imageUrl: string | undefined;
  title: string;
  priority?: boolean;
  className?: string;
  parallaxStyle?: CSSProperties;
}

function SlideImage({ imageUrl, title, priority, className = "", parallaxStyle }: SlideImageProps) {
  if (!imageUrl) {
    return (
      <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-gradient-to-br from-[color:var(--brand)] via-[color:var(--brand-light)] to-[color:var(--brand-strong)]">
        <span className="font-display text-5xl font-black text-white/90 md:text-6xl">
          {title.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 will-change-transform motion-reduce:transform-none"
      style={parallaxStyle}
    >
      <Image
        src={imageUrl}
        alt={title}
        fill
        unoptimized
        priority={priority}
        sizes="(max-width: 768px) 94vw, (max-width: 1280px) 88vw, 1400px"
        className={`object-contain ${className}`}
      />
    </div>
  );
}

export function CompanyGallerySlider({ items, labels }: CompanyGallerySliderProps) {
  const text = labels;
  const defaultIndex = getDefaultSlideIndex(items.length);
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [progressCycle, setProgressCycle] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const motionDisabled = prefersReducedMotion;
  const scrollParallax = useScrollParallax(stageRef, motionDisabled);
  const {
    offset: pointerParallax,
    onPointerMove,
    onPointerLeave,
  } = usePointerParallax(viewportRef, motionDisabled);

  const slideCount = items.length;
  const activeItem = items[activeIndex];
  const prevIndex = slideCount > 0 ? (activeIndex - 1 + slideCount) % slideCount : 0;
  const nextIndex = slideCount > 0 ? (activeIndex + 1) % slideCount : 0;
  const showAutoplayProgress = slideCount > 1 && !isPaused && !prefersReducedMotion;

  const activeImageParallax: CSSProperties = motionDisabled
    ? {}
    : {
        transform: `translate3d(${pointerParallax.x}px, ${scrollParallax.imageTranslateY + pointerParallax.y}px, 0)`,
        transition: "transform 0.12s ease-out",
      };

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
      setProgressCycle((cycle) => cycle + 1);
    },
    [slideCount],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (slideCount <= 1 || isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, prefersReducedMotion, slideCount]);

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
        className="gallery-frame relative overflow-visible rounded-[35px]"
        style={
          motionDisabled
            ? undefined
            : { transform: `translate3d(0, ${scrollParallax.frameTranslateY}px, 0)` }
        }
      >
        <div
          ref={stageRef}
          className="gallery-stage relative overflow-hidden rounded-[35px] bg-[#0d0818]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <div
            className="pointer-events-none absolute inset-0 will-change-transform motion-reduce:transform-none"
            style={
              motionDisabled
                ? undefined
                : { transform: `translate3d(0, ${scrollParallax.glowTranslateY}px, 0)` }
            }
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(140,82,255,0.28),transparent_68%)]" />
            <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(rgba(255,255,255,0.95)_0.5px,transparent_0.5px)] [background-size:4px_4px]" />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent)]"
            aria-hidden="true"
          />

          <div className="relative z-10 flex items-center justify-start gap-4 px-4 pt-4 md:px-7 md:pt-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/88 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_10px_rgba(126,217,87,0.85)]" />
              {text.badge}
            </div>
          </div>

          {slideCount > 1 ? (
            <div className="relative z-10 mx-4 mt-3 h-[2px] overflow-hidden rounded-full bg-white/10 md:mx-7">
              <div
                key={progressCycle}
                className={[
                  "h-full origin-left rounded-full bg-gradient-to-r from-[color:var(--accent)] via-[#b388ff] to-[color:var(--brand-light)]",
                  showAutoplayProgress ? "gallery-progress-bar" : "w-0",
                ].join(" ")}
                style={showAutoplayProgress ? { animationDuration: `${AUTOPLAY_MS}ms` } : undefined}
                aria-hidden="true"
              />
            </div>
          ) : null}

          <div className="relative z-10 px-2 py-5 md:px-6 md:py-8">
            <div
              ref={viewportRef}
              className="relative mx-auto flex aspect-[4/3] h-auto w-full max-w-6xl items-center justify-center md:aspect-auto md:h-[min(68vh,760px)]"
            >
              {slideCount > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(prevIndex)}
                    aria-label={text.prevSlide}
                    className="group/peek absolute left-0 z-10 hidden h-[72%] w-[14%] cursor-pointer overflow-hidden rounded-xl border border-white/8 bg-black/25 opacity-0 transition duration-500 hover:border-white/20 hover:opacity-100 md:block lg:left-2 lg:w-[12%] lg:opacity-35 lg:hover:opacity-80"
                  >
                    <SlideImage
                      imageUrl={getHeroImageUrl(items[prevIndex]?.imageUrl)}
                      title={items[prevIndex]?.title ?? ""}
                      className="opacity-80 transition group-hover/peek:opacity-100"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(nextIndex)}
                    aria-label={text.nextSlide}
                    className="group/peek absolute right-0 z-10 hidden h-[72%] w-[14%] cursor-pointer overflow-hidden rounded-xl border border-white/8 bg-black/25 opacity-0 transition duration-500 hover:border-white/20 hover:opacity-100 md:block lg:right-2 lg:w-[12%] lg:opacity-35 lg:hover:opacity-80"
                  >
                    <SlideImage
                      imageUrl={getHeroImageUrl(items[nextIndex]?.imageUrl)}
                      title={items[nextIndex]?.title ?? ""}
                      className="opacity-80 transition group-hover/peek:opacity-100"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden="true" />
                  </button>
                </>
              ) : null}

              <div className="relative z-20 h-full w-full max-w-5xl px-1 md:px-10">
                {items.map((item, index) => {
                  const imageUrl = getHeroImageUrl(item.imageUrl);
                  const isActive = index === activeIndex;

                  return (
                    <article
                      key={item.id}
                      aria-hidden={!isActive}
                      aria-current={isActive ? "true" : undefined}
                      className={[
                        "absolute inset-0 flex items-center justify-center",
                        prefersReducedMotion
                          ? isActive
                            ? "z-20 opacity-100"
                            : "pointer-events-none z-0 opacity-0"
                          : isActive
                            ? "gallery-slide-enter z-20 opacity-100"
                            : "pointer-events-none z-0 opacity-0 transition-opacity duration-700 ease-out",
                      ].join(" ")}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/12 bg-[#120a24]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_40px_80px_-36px_rgba(0,0,0,0.85)] ring-1 ring-[color:var(--brand)]/20">
                        <div
                          className="pointer-events-none absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(140,82,255,0.22),transparent_70%)]"
                          aria-hidden="true"
                        />
                        <SlideImage
                          imageUrl={imageUrl}
                          title={item.title}
                          priority={index === defaultIndex}
                          parallaxStyle={isActive ? activeImageParallax : undefined}
                        />
                      </div>
                    </article>
                  );
                })}

                {slideCount > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label={text.prevSlide}
                      className="absolute left-1 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/18 bg-black/45 text-white shadow-[0_12px_28px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:border-[color:var(--brand-light)] hover:bg-[color:var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-light)] md:-left-1 md:h-11 md:w-11"
                    >
                      <ChevronIcon direction="left" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label={text.nextSlide}
                      className="absolute right-1 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/18 bg-black/45 text-white shadow-[0_12px_28px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:border-[color:var(--brand-light)] hover:bg-[color:var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-light)] md:-right-1 md:h-11 md:w-11"
                    >
                      <ChevronIcon direction="right" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {slideCount > 1 ? (
            <div className="relative z-10 border-t border-white/8 bg-black/20 px-3 py-3 md:px-7 md:py-5">
              <div className="mx-auto flex max-w-6xl items-center justify-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin] md:gap-2">
                {items.map((item, index) => {
                  const thumbUrl = getThumbImageUrl(item.imageUrl);
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={`${item.id}-thumb`}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={`${text.goToSlide} ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className={[
                        "group/thumb relative h-12 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition duration-300 md:h-16 md:w-24",
                        isActive
                          ? "border-[color:var(--brand-light)] shadow-[0_0_24px_rgba(140,82,255,0.35)] ring-2 ring-[color:var(--brand-light)]/50"
                          : "border-white/15 opacity-70 hover:border-white/35 hover:opacity-100",
                      ].join(" ")}
                    >
                      {thumbUrl ? (
                        <Image
                          src={thumbUrl}
                          alt={item.title}
                          fill
                          unoptimized
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[color:var(--brand)]/65" />
                      )}
                      <span
                        className={[
                          "absolute inset-0 transition duration-300",
                          isActive ? "bg-transparent" : "bg-black/35 group-hover/thumb:bg-black/15",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      {isActive ? (
                        <span
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-[color:var(--accent)]"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <WinterOrnament
          name="silver-ornament-pine"
          motion="float"
          placement="home-gallery-silver"
          sizes="330px"
        />
      </div>
    </div>
  );
}
