# Global Blizzard Snow Effect Design

## Goal

Add a dense, premium blizzard effect across the entire website, including the landing page and every page reachable from the primary navigation. The effect must remain decorative, preserve readability and interaction, and perform well on desktop and mobile.

## Approach

Use one fixed Canvas 2D overlay mounted from the root layout. A single canvas is preferable to hundreds of animated DOM nodes for a dense storm, while avoiding the complexity and maintenance cost of WebGL.

The overlay will:

- cover the viewport and remain active across client-side navigation;
- use `pointer-events: none` and `aria-hidden="true"`;
- sit above page content but below the sticky header, drawers, chat widget, scroll-to-top control, and skip link;
- avoid adding a third-party animation dependency.

## Visual Behavior

The storm uses three depth layers:

- distant flakes: small, slow, and faint;
- middle flakes: medium size and speed;
- foreground flakes: larger, brighter, faster, and slightly stretched by wind.

Desktop uses approximately 220-280 particles. Mobile uses approximately 100-140 particles. Horizontal wind changes gradually over time, with occasional stronger gusts. Particles wrap around viewport edges to keep the storm continuous without allocation churn.

Opacity, size, blur, and speed vary per particle. Snow remains visually dense without creating a solid white veil over text and controls.

## Runtime Design

The client component owns the canvas, particle array, animation frame, resize handling, and visibility handling.

- Animate with `requestAnimationFrame` and elapsed time rather than frame-count movement.
- Cap device pixel ratio to prevent excessive canvas memory and fill cost.
- Recalculate canvas dimensions and particle targets on resize.
- Pause animation while the document is hidden and resume without a large time jump.
- Reuse particle objects rather than creating new objects every frame.
- Preserve the canvas across route transitions by mounting it once in `src/app/layout.tsx`.

## Accessibility

When `prefers-reduced-motion: reduce` is active, do not run the animation loop. Render a sparse static snow frame instead. The canvas is decorative and excluded from the accessibility tree.

## Layering

The snow overlay will use a global fixed layer below the existing interactive floating UI:

- snow: below `z-48`;
- scroll-to-top: `z-48`;
- header and chat: `z-50`;
- skip link: `z-100`.

This keeps snowfall visible over page sections while all navigation and floating controls remain clear and clickable.

## Verification

- Verify landing, About, Blogs, Careers, and Contact routes.
- Check desktop widths at 1024px and 1440px.
- Check mobile widths at 375px and 500px.
- Confirm navigation, forms, chat, and floating buttons remain clickable.
- Confirm no horizontal scrolling or layout shift.
- Confirm reduced-motion disables continuous animation.
- Run ESLint, TypeScript, production build, and local browser screenshots.

## References

- https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
- https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
