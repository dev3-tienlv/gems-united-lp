# Site-wide Winter Background and Ornaments

## Goal

Extend the approved Winter visual language from the landing page to the public navigation pages while preserving the existing content hierarchy, card components, and footer treatment.

## Routes

- `/about-us`
- `/blogs` and `/blog/[slug]`
- `/careers` and `/careers/[slug]`
- `/contact`

The shared snowfall remains mounted globally and is not duplicated by this change.

## Background System

- Add a reusable `winter-page` wrapper for the listed routes.
- Use `/xmas/page-winter-desktop.png` on desktop and `/xmas/page-winter-mobile.png` below 768px.
- Let the background continue behind the header and page sections.
- Remove opaque section backgrounds only where they hide the Winter canvas.
- Keep cards, article bodies, forms, maps, and other readability-critical surfaces opaque or softly translucent.
- Keep the existing dark footer unchanged.

## Ornament Assets

Copy the seven supplied transparent PNG files into `public/xmas/ornaments/` with concise stable filenames.

| Asset | Primary use |
| --- | --- |
| `01_silver_ornament_pine.png` | Lower corner of editorial or informational surfaces |
| `02_purple_gift_boxes.png` | Card-grid or CTA edge accent |
| `03_red_ribbon_gift_snow.png` | Bottom edge of a CTA or section transition |
| `04_snow_corner_red_bow.png` | Top edge snow cap on selected large surfaces |
| `05_pine_berries_side.png` | Vertical section edge accent |
| `06_snowy_red_gift.png` | Career/contact card edge accent |
| `07_fairy_lights_pine.png` | Upper corner or section transition accent |

## Placement Rules

- Ornaments are decorative, `aria-hidden`, non-interactive, and `pointer-events: none`.
- Place them outside the normal document flow so section height and card geometry do not change.
- Ornament layers may overlap card and section edges but must not cover headings, body copy, buttons, links, form controls, or article media.
- Use at most two prominent ornaments per section and avoid repeating the same asset in adjacent sections.
- Use shared placement variants instead of route-specific CSS duplication.
- On mobile, reduce ornament scale and hide low-value decorations when they would compete with content.
- Preserve enough overflow where an ornament crosses a section edge; clip only when needed to prevent horizontal scrolling.

## Route Composition

- About: fairy lights near the hero transition, pine/ornament on a story or values surface, ribbon gift near the final CTA.
- Blogs: snow cap or lights around the listing header; purple gifts near the card grid edge. Blog detail keeps the article body clean and places ornaments only around the hero/media boundary and related-post area.
- Careers: pine edge near the listing header and a red gift around the job-card region. Career detail keeps job copy and application controls unobstructed, with decoration limited to hero and related-jobs transitions.
- Contact: snow cap at the contact surface and a gift/pine accent around the map card without covering contact information.

## Motion

- Apply a slow 5–8 second sway using small rotation and vertical translation values.
- Stagger durations and delays so decorations do not move in sync.
- Do not animate the wide snow-cap asset aggressively; it may use only subtle breathing movement or remain static.
- Disable all ornament animation under `prefers-reduced-motion: reduce`.

## Responsive and Accessibility Requirements

- No horizontal page overflow at 390px, 768px, 1024px, or 1440px.
- Text and controls retain their current contrast and hit areas.
- Decorative images use empty alt text and remain hidden from assistive technology.
- The Winter background must not replace opaque reading surfaces on long-form blog and career detail pages.

## Verification

- Verify all listed routes at desktop and mobile sizes.
- Confirm ornaments do not block pointer input or overlap key content.
- Confirm reduced-motion disables ornament animation and snowfall behavior remains unchanged.
- Run ESLint, TypeScript, production build, route budgets, and `git diff --check`.
