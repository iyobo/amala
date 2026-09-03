# Documentation site design brief

## User goal

Help a TypeScript/Koa developer recognize Amala 12 as the small, type-safe layer over Koa, understand the release's typed-context improvement, and run a first endpoint without guessing at configuration or framework behavior.

## Information hierarchy

1. A v12 release marker and a direct promise: keep Koa while gaining an explicit context contract.
2. One primary action for v12 setup and a secondary migration action for existing users.
3. A realistic typed-context example, followed by the familiar controller model.
4. A compact explanation of what changed, what remains application-owned, and why that keeps Amala small.
5. Concise capability cards for routing, validation, OpenAPI, and framework control.
6. Clear next steps for installation, migration, configuration, and security.

## States and responsive behavior

- Desktop: asymmetric two-column hero, layered code panel, release strip, and four-column capability grid.
- Tablet and mobile: single-column flow, full-width actions, horizontally scrollable code, usable version selector, and no clipped navigation or content.
- Light and dark themes: preserve contrast and hierarchy using shared color tokens.
- Reduced motion: no required animation; hover effects remain cosmetic.

## Copy and feedback

- Use sentence case and current TypeScript terminology.
- Lead with “Keep Koa. Add a contract.” and avoid implying runtime enforcement from TypeScript generics.
- Avoid unsupported performance or scalability claims.
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
- The navbar version selector exposes current v12 documentation and the preserved v11 snapshot. Older unversioned releases remain available through Git history rather than the live selector.
