# Amala project guidance

## Framework scope

- Keep Amala Koa-first and small. Do not add a dependency-injection container, binding registry, service locator, or container lifecycle abstraction. Applications may expose their own services through typed Koa state or context.
- Preserve user-supplied Koa state and context-extension generics through every context-bearing public API. Use safe empty-object defaults instead of Koa's open-ended `DefaultState` and `DefaultContext` types; users may opt into those defaults explicitly when needed.
- Treat those generics as compile-time safeguards, not runtime authentication or validation. Continue to validate attacker-controlled request inputs at runtime and leave application-created context values under application ownership.
- Bootstrap should return an application that is usable by default. Generated routes are mounted automatically; preserve explicit `attachRoutes: false` as the advanced middleware-composition escape hatch.

## Documentation examples

- Keep every TypeScript code fence in the README and current documentation grounded in a `bootstrapControllers()` call. Prefer a complete small application or show the option being explained inside its bootstrap call; do not publish isolated controller, decorator, or configuration fragments.
