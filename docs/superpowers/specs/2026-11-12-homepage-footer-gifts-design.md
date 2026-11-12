# Homepage Footer Gifts Design

## Goal

Move the two red Christmas gift ornaments from their current homepage sections to the boundary between the final Contact section and the footer.

## Scope

- Remove `red-ribbon-gift-snow` from the Values section.
- Remove `snowy-red-gift` from the Careers section.
- Render both ornaments once, immediately after the Contact section and before the footer.
- Keep this decoration homepage-only.
- Preserve all existing section content, winter backgrounds, spacing, footer structure, and snowfall behavior.

## Layout

- Use a zero-height, relatively positioned boundary anchor after the Contact section so the ornaments do not add page height.
- Place `red-ribbon-gift-snow` on the lower-left side.
- Place `snowy-red-gift` on the lower-right side.
- Let both ornaments overlap the footer edge slightly.
- Offset each ornament beyond the viewport edge so part of the artwork is naturally clipped.
- Keep the ornaments behind interactive content and disable pointer events.

## Responsive Behavior

- Desktop: show both ornaments at a balanced decorative scale on opposite sides of the page.
- Mobile: reduce their size and edge offsets so they do not cover the Contact content or footer CTA.
- Avoid horizontal overflow at all viewport sizes.

## Motion

- Retain subtle existing ornament motion where appropriate.
- Respect `prefers-reduced-motion` through the existing `WinterOrnamentStyles` behavior.

## Implementation Boundaries

- Add dedicated footer-left and footer-right placement names to the existing `WinterOrnament` placement system.
- Do not add the ornaments to the shared `Footer` component, because other pages must remain unchanged.
- Do not introduce a wrapper around `ContactSection`; its current direct-child relationship controls the transparent winter background.

## Verification

- Confirm the old Values and Careers placements are gone.
- Confirm both ornaments appear at the Contact/footer boundary on desktop and mobile.
- Confirm the ornaments do not cover links, CTA controls, or footer text.
- Confirm `document.documentElement.scrollWidth === window.innerWidth` on mobile.
- Run ESLint, TypeScript checking, and `git diff --check`.
