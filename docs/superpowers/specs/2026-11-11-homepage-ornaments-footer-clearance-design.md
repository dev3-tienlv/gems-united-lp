# Homepage Ornaments and Footer Clearance

## Goal

Prevent page content from visually colliding with the footer wave and use the seven new Christmas ornaments only on the homepage.

## Root Cause

The footer wave is absolutely positioned 80–96px above the footer. New page-specific Tailwind padding utilities may remain absent in a browser tab that cached the old stylesheet, allowing the wave to cover the final cards or surface. The clearance must therefore come from inline component CSS that is delivered with current HTML.

## Footer Clearance

- Reserve 96px before the footer on desktop and 80px on mobile.
- Apply the rule to both `WinterPageShell` pages and the homepage Winter wrapper.
- Keep the existing footer wave and footer content unchanged.
- Do not rely on newly generated Tailwind spacing utilities for this safety area.

## Route Scope

- Keep Winter backgrounds and snowfall on `/about-us`, `/blogs`, `/careers`, `/contact`, blog detail, and career detail.
- Remove every `WinterOrnament` instance from those routes.
- Keep the ornament asset files because the homepage consumes all seven.

## Homepage Placement

- `snow-corner-red-bow.png`: overlap the top edge of the company gallery stage, directly above the badge row.
- `pine-berries-side.png`: overlap the lower-left corner of the gallery image/stage.
- `silver-ornament-pine.png`: overlap the lower-right corner of the gallery image/stage.
- `purple-gift-boxes.png`: sit at the lower-right edge of the Offers copy block.
- `fairy-lights-pine.png`: upper-right accent around the company gallery section.
- `red-ribbon-gift-snow.png`: lower edge of the Values section.
- `snowy-red-gift.png`: lower-right edge of the homepage Careers section.

## Responsive and Motion Rules

- Decorations are `aria-hidden`, have empty alt text, and never receive pointer events.
- Mobile keeps only ornaments that do not cover headings, controls, or primary imagery; secondary ornaments may be hidden.
- Sway remains subtle and stops under `prefers-reduced-motion: reduce`.
- Ornament positioning is emitted through inline component CSS to bypass stale asset bundles.

## Verification

- Confirm the final content/card bottom stays below the footer wave on all Winter pages.
- Verify homepage placements at 1536x864 and 390x844.
- Verify no ornament remains outside `/`.
- Run ESLint, TypeScript, production build, route budgets, and `git diff --check`.
