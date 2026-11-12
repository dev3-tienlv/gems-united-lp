# Site-wide Winter Background and Ornaments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing Winter background to all public navigation routes and place the seven supplied Christmas ornaments at controlled card and section edges.

**Architecture:** Add one Server Component module that owns the shared Winter wrapper, inline cache-safe CSS, ornament metadata, and decorative image rendering. Route files opt into the wrapper and place ornaments locally at stable section boundaries, while long-form reading surfaces remain opaque.

**Tech Stack:** Next.js 16 App Router, React Server Components, TypeScript, Tailwind CSS, `next/image`, inline scoped CSS.

---

### Task 1: Import and verify ornament assets

**Files:**
- Create: `public/xmas/ornaments/silver-ornament-pine.png`
- Create: `public/xmas/ornaments/purple-gift-boxes.png`
- Create: `public/xmas/ornaments/red-ribbon-gift-snow.png`
- Create: `public/xmas/ornaments/snow-corner-red-bow.png`
- Create: `public/xmas/ornaments/pine-berries-side.png`
- Create: `public/xmas/ornaments/snowy-red-gift.png`
- Create: `public/xmas/ornaments/fairy-lights-pine.png`

- [x] **Step 1: Copy the supplied PNG files without modifying the originals**

Copy each matching `/Users/tienlv/Downloads/0N_*.png` file to the stable public path listed above.

- [x] **Step 2: Verify intrinsic dimensions and alpha channels**

Run:

```bash
for file in public/xmas/ornaments/*.png; do
  sips -g pixelWidth -g pixelHeight -g hasAlpha "$file"
done
```

Expected: seven PNG files, each reporting `hasAlpha: yes`.

### Task 2: Build the shared Winter page primitives

**Files:**
- Create: `src/components/xmas/WinterPageDecor.tsx`

- [x] **Step 1: Define the ornament contract and intrinsic metadata**

Create a typed `ORNAMENTS` map containing `src`, `width`, and `height` for all seven assets. Export a `WinterOrnament` component with this interface:

```tsx
type WinterOrnamentName = keyof typeof ORNAMENTS;

type WinterOrnamentProps = {
  name: WinterOrnamentName;
  className?: string;
  motion?: "sway" | "float" | "still";
  sizes?: string;
};
```

Render `next/image` with `alt=""`, `aria-hidden="true"`, `pointer-events-none`, explicit intrinsic dimensions, responsive `sizes`, and lazy loading.

- [x] **Step 2: Add the shared wrapper and cache-safe styles**

Export `WinterPageShell` that injects inline styles and renders a root `.winter-page` wrapper. The styles must:

```css
.winter-page {
  --bg: #ffffff;
  --surface: #ffffff;
  --soft: #f7f5ff;
  --ink: #1b1332;
  --ink-2: #2a2340;
  --muted: #5a527c;
  --line: #ded3f3;
  position: relative;
  isolation: isolate;
  overflow-x: clip;
  background: #d7c6fa url("/xmas/page-winter-desktop.png") top center / 100% auto repeat-y;
}

@media (max-width: 767px) {
  .winter-page {
    background-image: url("/xmas/page-winter-mobile.png");
  }
}
```

Add slow, out-of-phase `sway` and `float` keyframes using at most 2 degrees rotation and 8px translation. Under `prefers-reduced-motion: reduce`, set ornament animation to `none`.

- [x] **Step 3: Run focused static verification**

Run:

```bash
npx eslint src/components/xmas/WinterPageDecor.tsx
npx tsc --noEmit
```

Expected: both commands exit 0.

### Task 3: Apply the system to listing and contact routes

**Files:**
- Modify: `src/app/blogs/page.tsx`
- Modify: `src/app/careers/page.tsx`
- Modify: `src/app/contact/page.tsx`

- [x] **Step 1: Wrap each route with `WinterPageShell`**

Replace each top-level opaque background wrapper with:

```tsx
<WinterPageShell>
  <Header ... />
  <main id="main-content">...</main>
  <Footer ... />
</WinterPageShell>
```

Keep the footer unchanged and change only the main content section backgrounds to transparent.

- [x] **Step 2: Add controlled listing ornaments**

- Blogs: `fairy-lights-pine` at the upper-right section edge and `purple-gift-boxes` at the lower-left card-grid edge.
- Careers: `pine-berries-side` at the upper-left section edge and `snowy-red-gift` at the lower-right grid edge.
- Contact: `snow-corner-red-bow` along the top edge and `silver-ornament-pine` near the lower corner of the map surface.

Each containing section or wrapper must be `relative`; ornament layers use negative edge offsets, responsive widths, `z-0`, and content uses `relative z-10`.

- [x] **Step 3: Verify listing routes**

Run ESLint on the three route files and inspect `/blogs`, `/careers`, and `/contact` at 1440x900 and 390x844. Confirm no horizontal overflow and no overlap with headings, cards, map controls, or footer.

### Task 4: Apply the system to About and detail routes

**Files:**
- Modify: `src/app/about-us/page.tsx`
- Modify: `src/components/about/AboutHero.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `src/app/careers/[slug]/page.tsx`

- [x] **Step 1: Apply the Winter wrapper to About**

Wrap the page with `WinterPageShell`, make section canvases transparent, and keep cards opaque. Place `fairy-lights-pine` at the About hero transition, `silver-ornament-pine` at the values section edge, and `red-ribbon-gift-snow` near the final CTA transition.

- [x] **Step 2: Apply the Winter wrapper to blog detail**

Make the hero canvas transparent but retain the existing opaque article/media surfaces. Place `snow-corner-red-bow` around the hero-to-media boundary and `purple-gift-boxes` near the related-post area. Do not place ornaments inside article prose.

- [x] **Step 3: Apply the Winter wrapper to career detail**

Make the hero and outer page canvas transparent while preserving opaque job-description and application surfaces. Place `pine-berries-side` at the hero edge and `snowy-red-gift` near related jobs, away from application controls.

- [x] **Step 4: Verify detail routes**

Inspect one real blog slug and one real career slug at desktop and mobile widths. Confirm article copy, job requirements, calls to action, and navigation remain unobstructed.

### Task 5: Final quality gate

**Files:**
- Review all files changed by Tasks 1–4.

- [x] **Step 1: Verify accessibility and motion**

Confirm ornament images have empty alt text, `aria-hidden`, and `pointer-events: none`. Emulate `prefers-reduced-motion: reduce` and verify ornament animations stop.

- [x] **Step 2: Run the complete verification suite**

Run:

```bash
npx eslint src/components/xmas/WinterPageDecor.tsx src/app/about-us/page.tsx src/components/about/AboutHero.tsx src/app/blogs/page.tsx 'src/app/blog/[slug]/page.tsx' src/app/careers/page.tsx 'src/app/careers/[slug]/page.tsx' src/app/contact/page.tsx
npx tsc --noEmit
npm run build
npm run budget:routes
git diff --check
```

Expected: all commands exit 0; the budget script may retain its existing informational warning for `/careers/[id]` but must report that all route JS budgets passed.

- [x] **Step 3: Review the final diff**

Check correctness, readability, route-wide consistency, accessibility, and image-loading cost. Do not commit because the user has not requested a commit.
