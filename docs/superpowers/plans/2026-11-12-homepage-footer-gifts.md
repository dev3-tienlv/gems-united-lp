# Homepage Footer Gifts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the two red Christmas gift ornaments from the Values and Careers sections to opposite sides of the Contact/footer boundary on the homepage.

**Architecture:** Keep the shared footer unchanged and add a zero-height ornament anchor immediately after `ContactSection` in the homepage main content. Extend the existing `WinterOrnament` placement union and responsive CSS with homepage footer-left and footer-right placements so the assets overlap the footer edge without affecting layout.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, `next/image`, Chrome DevTools runtime checks

---

### Task 1: Add footer boundary ornament placements

**Files:**
- Modify: `src/components/xmas/WinterPageDecor.tsx:15-21`
- Modify: `src/components/xmas/WinterPageDecor.tsx:85-90`
- Modify: `src/components/xmas/WinterPageDecor.tsx:102-109`

- [ ] **Step 1: Replace the old placement names in the type union**

Replace `home-careers-gift` and `home-values-ribbon` with dedicated boundary placements:

```tsx
type WinterOrnamentPlacement =
  | "home-footer-left"
  | "home-footer-right"
  | "home-gallery-lights"
  | "home-gallery-silver"
  | "home-gallery-snow"
  | "home-offers-gifts";
```

- [ ] **Step 2: Define mobile placement rules**

Replace the old Values and Careers rules with left/right rules sized for the 80px mobile footer clearance:

```css
.winter-ornament--home-footer-left { bottom: -92px; left: -92px; width: 250px; }
.winter-ornament--home-footer-right { bottom: -100px; right: -42px; width: 175px; }
```

- [ ] **Step 3: Define desktop placement rules**

Inside the existing `@media (min-width: 768px)` block, replace the old placement rules with sizes balanced around the 96px desktop footer clearance:

```css
.winter-ornament--home-footer-left { bottom: -116px; left: -92px; width: 360px; }
.winter-ornament--home-footer-right { bottom: -130px; right: -54px; width: 270px; }
```

- [ ] **Step 4: Run focused static checks**

Run:

```bash
npx eslint src/components/xmas/WinterPageDecor.tsx
npx tsc --noEmit
```

Expected: both commands exit with status 0.

### Task 2: Move both gifts to the Contact/footer boundary

**Files:**
- Modify: `src/app/page.tsx:44-52`
- Modify: `src/app/page.tsx:74-82`
- Modify: `src/app/page.tsx:116-119`

- [ ] **Step 1: Remove the gift from the Values section**

Delete this block from `#values`:

```tsx
<WinterOrnament
  name="red-ribbon-gift-snow"
  placement="home-values-ribbon"
  sizes="(max-width: 767px) 250px, 460px"
/>
```

- [ ] **Step 2: Remove the gift from the Careers section**

Delete this block from `#careers`:

```tsx
<WinterOrnament
  name="snowy-red-gift"
  motion="float"
  placement="home-careers-gift"
  sizes="(max-width: 767px) 180px, 310px"
/>
```

- [ ] **Step 3: Add the zero-height boundary anchor**

Immediately after `ContactSection` and before `</main>`, add:

```tsx
<div className="relative z-20 h-0" aria-hidden="true">
  <WinterOrnament
    name="red-ribbon-gift-snow"
    placement="home-footer-left"
    sizes="(max-width: 767px) 250px, 360px"
  />
  <WinterOrnament
    name="snowy-red-gift"
    motion="float"
    placement="home-footer-right"
    sizes="(max-width: 767px) 175px, 270px"
  />
</div>
```

This anchor must remain a sibling of `ContactSection`; do not wrap `ContactSection`, because the homepage winter CSS targets direct child sections.

- [ ] **Step 4: Verify old placements are absent**

Run:

```bash
rg -n "home-values-ribbon|home-careers-gift" src
```

Expected: no matches.

- [ ] **Step 5: Run focused code checks**

Run:

```bash
npx eslint src/app/page.tsx src/components/xmas/WinterPageDecor.tsx
npx tsc --noEmit
git diff --check
```

Expected: all commands exit with status 0.

### Task 3: Verify desktop and mobile rendering

**Files:**
- Verify: `src/app/page.tsx`
- Verify: `src/components/xmas/WinterPageDecor.tsx`

- [ ] **Step 1: Confirm the local homepage responds**

Run:

```bash
curl -sS -o /dev/null -w 'home=%{http_code}\n' http://localhost:3000/
```

Expected: `home=200`.

- [ ] **Step 2: Verify mobile layout at 390x844**

Reload the homepage with a 390x844 mobile viewport and evaluate:

```js
() => ({
  viewportWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  footerLeftCount: document.querySelectorAll('.winter-ornament--home-footer-left').length,
  footerRightCount: document.querySelectorAll('.winter-ornament--home-footer-right').length,
})
```

Expected: `viewportWidth === scrollWidth`, with one left ornament and one right ornament.

- [ ] **Step 3: Verify desktop layout at 1440x1000**

Reload at 1440x1000 and visually confirm:

- The wide ribbon gift sits on the left.
- The upright snowy gift sits on the right.
- Both overlap the footer boundary slightly.
- Neither ornament covers Contact controls, footer links, or the footer CTA.
- Neither ornament appears in Values or Careers.

- [ ] **Step 4: Check runtime errors**

Inspect the browser console after reload.

Expected: no new error messages caused by the ornament move.

### Task 4: Review the final diff

**Files:**
- Review: `src/app/page.tsx`
- Review: `src/components/xmas/WinterPageDecor.tsx`

- [ ] **Step 1: Inspect only the scoped implementation diff**

Run:

```bash
git diff -- src/app/page.tsx src/components/xmas/WinterPageDecor.tsx
```

Expected: the diff only removes the two old placements, adds the boundary anchor, and replaces the old placement CSS/type names.

- [ ] **Step 2: Confirm success criteria**

Confirm all of the following before completion:

- The shared `Footer` component is unchanged.
- Other pages do not render either footer gift.
- Existing winter background and snowfall behavior remain unchanged.
- Mobile has no horizontal overflow.
- Static checks and runtime checks pass.
