# Global Snowfall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the AlmaGems Christmas snowfall motion across every Gems United route.

**Architecture:** Create snowflake DOM elements once in a focused root-level Client Component and animate them with global CSS keyframes. Keep the root layout server-rendered and preserve the effect across client navigation.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS animations.

---

### Task 1: Implement Reference-Matched Snowfall

**Files:**
- Create: `src/components/effects/GlobalSnowfall.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] Create 85 desktop or 40 mobile randomized circular flakes using the value ranges from `amagems/assets/page-christmas-landing.js`.
- [ ] Add fall and sway keyframes matching `amagems/assets/page-christmas-landing.css`.
- [ ] Disable snowfall for reduced-motion users.
- [ ] Mount the component once in `src/app/layout.tsx`.
- [ ] Verify lint, types, browser behavior, production build, and route budgets.
