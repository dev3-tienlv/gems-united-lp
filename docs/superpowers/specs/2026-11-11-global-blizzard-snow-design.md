# Global Snowfall Effect Design

## Goal

Add a subtle, natural Christmas snowfall across the entire website, matching the motion language used by the AlmaGems Christmas landing page while preserving navigation, readability, accessibility, and performance.

## Reference

The source implementation in `/Users/tienlv/WorkSpace/amagems` uses:

- `assets/page-christmas-landing.js` to create randomized snowflake elements;
- `assets/page-christmas-landing.css` for fall and sway animations;
- 85 flakes on desktop and 40 flakes on mobile;
- circular white flakes sized from 1px to 4px;
- randomized opacity, blur, duration, delay, horizontal drift, and rotation;
- no snowfall when `prefers-reduced-motion: reduce` is active.

## Architecture

Mount one focused Client Component from the root layout so the snowfall persists through client-side navigation. The component creates snowflake spans in a document fragment and lets CSS animations handle all per-frame movement. No Canvas loop or third-party animation dependency is required.

The fixed snowfall layer uses `pointer-events: none`, is excluded from the accessibility tree, and remains below the sticky header, drawers, chat widget, scroll-to-top control, and skip link.

## Motion

Each snowflake receives randomized values within the same ranges as AlmaGems:

- horizontal position: `0-100vw`;
- size: `1-4px`;
- opacity: `0.45-0.95`;
- blur: `0-0.7px`;
- fall duration: `11-22s`;
- sway duration: `3-7s`;
- fall delay: `-22-0s`;
- sway delay: `-7-0s`;
- horizontal drift: `-45-45px`;
- rotation: `-120-120deg`.

The fall animation moves flakes from `-5vh` to `110vh`. A separate alternating sway animation shifts them gently from side to side.

## Responsive And Accessibility

- Desktop renders 85 flakes.
- Viewports below 750px render 40 flakes.
- Crossing the breakpoint on resize rebuilds the snowflake set.
- Reduced-motion renders no snowflakes and hides the overlay.
- Changing reduced-motion preferences updates the effect without reloading.

## Verification

- Verify `/`, `/about-us`, `/blogs`, `/careers`, and `/contact`.
- Confirm 85 desktop flakes and 40 mobile flakes.
- Confirm reduced-motion produces zero flakes.
- Confirm the snowfall container persists across client-side navigation.
- Confirm links, forms, menus, chat, and floating buttons remain clickable.
- Run ESLint, TypeScript, production build, and route-budget checks.
