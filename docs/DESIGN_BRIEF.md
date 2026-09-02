# Documentation site design brief

## User goal

Help a TypeScript/Koa developer decide whether Amala fits their API, understand its security boundaries, and run a first endpoint without guessing at configuration or framework behavior.

## Information hierarchy

1. A plain-language promise: typed Koa APIs with decorators and full access to Koa.
2. One primary action to start the guide and a secondary link to GitHub.
3. A realistic controller example that demonstrates the core programming model.
4. Concise capability cards for routing, validation, OpenAPI, and framework control.
5. Clear next steps for installation, configuration, security, and API reference.

## States and responsive behavior

- Desktop: two-column hero, readable code panel, four-column capability grid.
- Tablet and mobile: single-column flow, full-width actions, horizontally scrollable code, no clipped navigation or content.
- Light and dark themes: preserve contrast and hierarchy using shared color tokens.
- Reduced motion: no required animation; hover effects remain cosmetic.

## Copy and feedback

- Use sentence case and current TypeScript terminology.
- Avoid unsupported performance or scalability claims.
- Identify what Amala provides and what applications must provide, especially authentication and authorization.
- Every setup or error path should point to a concrete next action.

## Accessibility

- Logical heading order and descriptive link labels.
- Visible keyboard focus, sufficient color contrast, and no state conveyed by color alone.
- Decorative artwork remains hidden from assistive technology; meaningful code and labels remain text.
- Interactive targets remain at least 44px high on touch layouts.

## Visual tokens

- Brand: deep plum with warm amber accents, derived from the existing Amala food identity.
- Surfaces: warm off-white in light mode and softened charcoal-plum in dark mode.
- Geometry: modest radii, restrained shadows, and stable card dimensions.
- Typography: system sans for prose and the Docusaurus monospace stack for code.

## Open decisions

- Search is deferred until the documentation set is large enough to justify an indexing service.
- Versioned documentation is deferred until Amala has concurrently supported major versions.
