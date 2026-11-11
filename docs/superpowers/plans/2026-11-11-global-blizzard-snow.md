# Global Blizzard Snow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dense, smooth, accessible snowstorm overlay that persists across every application route.

**Architecture:** Create one focused Client Component containing a fixed Canvas 2D renderer, then mount it once from the Server Component root layout. The renderer reuses particles, caps device pixel ratio, adapts particle count for mobile, pauses in hidden tabs, and renders a static frame for reduced-motion users.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Canvas 2D, `requestAnimationFrame`, Tailwind CSS.

---

### Task 1: Add the global snowstorm renderer

**Files:**
- Create: `src/components/effects/GlobalSnowstorm.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create the Canvas 2D Client Component**

Create `src/components/effects/GlobalSnowstorm.tsx` with:

```tsx
"use client";

import { useEffect, useRef } from "react";

type Snowflake = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  wobble: number;
  phase: number;
  opacity: number;
  depth: number;
  stretch: number;
};

const MOBILE_BREAKPOINT = 768;
const DESKTOP_PARTICLES = 260;
const MOBILE_PARTICLES = 130;
const REDUCED_DESKTOP_PARTICLES = 70;
const REDUCED_MOBILE_PARTICLES = 40;
const DPR_CAP = 1.5;
const TAU = Math.PI * 2;

function particleTarget(width: number, reducedMotion: boolean) {
  const mobile = width < MOBILE_BREAKPOINT;
  if (reducedMotion) {
    return mobile ? REDUCED_MOBILE_PARTICLES : REDUCED_DESKTOP_PARTICLES;
  }
  return mobile ? MOBILE_PARTICLES : DESKTOP_PARTICLES;
}

function createSnowflake(width: number, height: number, fromTop = false): Snowflake {
  const depth = Math.random();
  return {
    x: Math.random() * width,
    y: fromTop ? -24 - Math.random() * height * 0.16 : Math.random() * height,
    radius: 0.8 + depth * 3.4,
    speed: 44 + depth * 178,
    drift: -18 + Math.random() * 36,
    wobble: 10 + Math.random() * 34,
    phase: Math.random() * TAU,
    opacity: 0.24 + depth * 0.7,
    depth,
    stretch: 1 + depth * 1.8,
  };
}

export function GlobalSnowstorm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Snowflake[] = [];
    let animationFrame = 0;
    let resizeFrame = 0;
    let previousTime = performance.now();

    const syncParticleCount = () => {
      const target = particleTarget(width, reducedMotion);
      if (particles.length > target) particles.length = target;
      while (particles.length < target) {
        particles.push(createSnowflake(width, height));
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      syncParticleCount();
    };

    const draw = (time: number, deltaSeconds: number, move: boolean) => {
      context.clearRect(0, 0, width, height);
      const gust = Math.sin(time * 0.00024) * 54 + Math.sin(time * 0.00071) * 24;

      for (const flake of particles) {
        if (move) {
          const wind = flake.drift + gust * (0.3 + flake.depth * 0.9);
          const sway = Math.sin(time * 0.0014 + flake.phase) * flake.wobble;
          flake.x += (wind + sway) * deltaSeconds;
          flake.y += flake.speed * deltaSeconds;

          if (flake.y > height + 32) {
            Object.assign(flake, createSnowflake(width, height, true));
          } else if (flake.x < -40) {
            flake.x = width + 32;
          } else if (flake.x > width + 40) {
            flake.x = -32;
          }
        }

        const windAngle = Math.atan2(gust * 0.45, flake.speed);
        context.save();
        context.translate(flake.x, flake.y);
        context.rotate(-windAngle);
        context.beginPath();
        context.ellipse(
          0,
          0,
          flake.radius,
          flake.radius * flake.stretch,
          0,
          0,
          TAU,
        );
        context.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        context.fill();
        context.restore();
      }
    };

    const animate = (time: number) => {
      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.04);
      previousTime = time;
      draw(time, deltaSeconds, true);
      animationFrame = requestAnimationFrame(animate);
    };

    const start = () => {
      cancelAnimationFrame(animationFrame);
      previousTime = performance.now();
      if (reducedMotion) {
        draw(previousTime, 0, false);
        return;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resize();
        start();
      });
    };

    const onVisibilityChange = () => {
      if (document.hidden) cancelAnimationFrame(animationFrame);
      else start();
    };

    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      syncParticleCount();
      start();
    };

    resize();
    start();
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[40] h-full w-full"
    />
  );
}
```

- [ ] **Step 2: Mount the overlay once in the root layout**

Import the component in `src/app/layout.tsx`:

```tsx
import { GlobalSnowstorm } from "@/components/effects/GlobalSnowstorm";
```

Render it immediately after the skip link and before `{children}`:

```tsx
<GlobalSnowstorm />
{children}
```

This keeps the root layout as a Server Component while defining the browser-only boundary in the focused snow component.

- [ ] **Step 3: Run focused static verification**

Run:

```bash
npx eslint src/components/effects/GlobalSnowstorm.tsx src/app/layout.tsx
npx tsc --noEmit
git diff --check
```

Expected: all commands exit `0` with no diagnostics.

- [ ] **Step 4: Verify behavior in the browser**

Check `/`, `/about-us`, `/blogs`, `/careers`, and `/contact` at desktop and mobile sizes. Confirm:

- snow remains visible after client-side navigation;
- header, drawer, chat, forms, and floating buttons remain clickable;
- the snow layer causes no horizontal scroll or layout shift;
- mobile uses visibly fewer particles while retaining the blizzard effect;
- emulating `prefers-reduced-motion: reduce` produces a static snow frame.

- [ ] **Step 5: Run production verification**

Run:

```bash
npm run build
npm run budget:routes
```

Expected: production build and route budgets pass.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/components/effects/GlobalSnowstorm.tsx src/app/layout.tsx
git commit -m "feat: add global blizzard snow effect"
```
