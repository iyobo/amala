# Documentation site design brief

## User goal

Help a TypeScript/Koa developer recognize Amala 13 as the small, type-safe layer over Koa, understand that bootstrap now returns a ready-to-listen app, and run a first endpoint without guessing at route attachment or framework behavior.

## Information hierarchy

1. A v13 release marker and a direct promise: keep Koa while gaining a ready-to-listen, explicitly typed application.
2. One primary action for v13 setup and a secondary migration action for existing users.
3. A realistic typed-context example, followed by the familiar controller model.
4. A compact explanation of what changed, what remains application-owned, and why that keeps Amala small.
5. Illustrated capability cards that pair each routing, input, validation, and OpenAPI claim with recognizable Amala code and its bootstrap context.
6. Clear next steps for installation, migration, configuration, and security.

## States and responsive behavior

- Desktop: asymmetric two-column hero, layered code panel, release strip, and a two-column capability grid with stable code-card geometry.
- Tablet and mobile: single-column flow, full-width actions, horizontally scrollable code inside its card, usable version selector, and no clipped navigation or page content.
- Light and dark themes: preserve contrast and hierarchy using shared color tokens.
- Reduced motion: no required animation; hover effects remain cosmetic.

## Copy and feedback

- Use sentence case and current TypeScript terminology.
- Lead with “Keep Koa. Add a contract.” and avoid implying runtime enforcement from TypeScript generics.
- Avoid unsupported performance or scalability claims.
- Pair every technical capability claim with code or another useful illustration; do not use feature prose merely to fill a card.
- Identify what Amala provides and what applications must provide, especially authentication and authorization.
- Every setup or error path should point to a concrete next action.

## Accessibility

- Logical heading order and descriptive link labels.
- Visible keyboard focus, sufficient color contrast, and no state conveyed by color alone.
- Decorative artwork remains hidden from assistive technology; meaningful code and labels remain text.
- Interactive targets remain at least 44px high on touch layouts.

## Visual tokens

- Brand: ink plum with yam-gold and coral accents, derived from the existing Amala food identity.
- Surfaces: layered warm paper in light mode and softened charcoal-plum in dark mode.
- Geometry: editorial rules, deliberate asymmetry, restrained shadows, and stable card dimensions.
- Typography: system sans for prose and the Docusaurus monospace stack for code.

## Open decisions

- Search is deferred until the documentation set is large enough to justify an indexing service.
- The navbar version selector exposes current v13 documentation and the preserved v12 and v11 snapshots. Older unversioned releases remain available through Git history rather than the live selector.
