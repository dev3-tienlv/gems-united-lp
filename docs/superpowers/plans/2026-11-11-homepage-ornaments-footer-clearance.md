# Homepage Ornaments and Footer Clearance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix footer-wave overlap and move all seven Christmas ornament placements from secondary routes to intentional homepage locations.

**Architecture:** Keep `WinterPageShell` as the shared background wrapper but reduce its ornament API to homepage placements. Emit footer clearance and ornament geometry through inline CSS so the result does not depend on a previously cached Tailwind bundle.

**Tech Stack:** Next.js 16 App Router, React Server Components, TypeScript, Tailwind CSS, `next/image`, inline scoped CSS.

---

### Task 1: Add cache-safe footer clearance

**Files:**
- Modify: `src/components/xmas/WinterPageDecor.tsx`
- Modify: `src/components/landing/WinterSectionBackgrounds.tsx`

- [x] Add inline CSS that gives direct footers `margin-top: 80px` on mobile and `96px` from 768px upward, leaving room for the existing absolute footer wave.
- [x] Verify on `/careers` and `/contact` that `footer.top - lastContent.bottom >= 79px` before accounting for the wave.

### Task 2: Remove ornaments from secondary routes

**Files:**
- Modify: `src/app/about-us/page.tsx`
- Modify: `src/app/blogs/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `src/app/careers/page.tsx`
- Modify: `src/app/careers/[slug]/page.tsx`
- Modify: `src/app/contact/page.tsx`

- [x] Remove `WinterOrnament` imports and JSX while retaining `WinterPageShell` and transparent reading surfaces.
- [x] Verify each route renders zero `.winter-ornament` elements and retains `.winter-page`.

### Task 3: Place the gallery ornaments

**Files:**
- Modify: `src/components/landing/CompanyGallery.tsx`
- Modify: `src/components/landing/CompanyGallerySlider.tsx`
- Modify: `src/components/xmas/WinterPageDecor.tsx`

- [x] Add `fairy-lights-pine` to the gallery section upper-right edge.
- [x] Add `snow-corner-red-bow` above the gallery badge row.
- [x] Add `pine-berries-side` to the stage lower-left and `silver-ornament-pine` to the stage lower-right.
- [x] Keep gallery controls above ornaments and preserve clipping only for the slide media, not the decorative outer edges.

### Task 4: Place the remaining homepage ornaments

**Files:**
- Modify: `src/components/landing/Offers.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/xmas/WinterPageDecor.tsx`

- [x] Add `purple-gift-boxes` to the lower-right of the Offers copy block.
- [x] Add `red-ribbon-gift-snow` to the lower edge of Values.
- [x] Add `snowy-red-gift` to the lower-right edge of homepage Careers.
- [x] Hide or scale secondary ornaments on mobile so headings, cards, and controls remain clear.

### Task 5: Verify and review

**Files:**
- Review every file modified in Tasks 1–4.

- [x] Run focused ESLint and `npx tsc --noEmit`.
- [x] Audit `/`, `/about-us`, `/blogs`, `/careers`, `/contact`, one blog detail, and one career detail at desktop and mobile sizes.
- [x] Confirm reduced motion disables ornament animation and ornaments never capture pointer events.
- [x] Run `npm run build`, `npm run budget:routes`, and `git diff --check`.
- [x] Review correctness, accessibility, asset loading, and scope; do not commit without user instruction.
