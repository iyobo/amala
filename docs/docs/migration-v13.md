---
sidebar_position: 1
sidebar_label: Migrate to v13
---

# Migrate to Amala 13

Amala 13 makes the common bootstrap path ready to listen: generated routes are now attached to the Koa application by default.

## What changed

In v12 and earlier, omitting `attachRoutes` generated the router but left it unmounted. Applications had to opt in or mount it manually:

```typescript
const {app, router} = await bootstrapControllers({
  controllers: [UserController],
});

app.use(router.routes());
app.use(router.allowedMethods());
```

In v13, the same bootstrap call mounts the generated routes automatically:

```typescript
const {app} = await bootstrapControllers({
  controllers: [UserController],
});

app.listen(3000);
```

## Most applications

Remove redundant `attachRoutes: true` options and manual `router.routes()` or `router.allowedMethods()` calls. The returned app is ready to listen.

Leaving an explicit `attachRoutes: true` in place is valid, so applications may remove it when convenient.

## Applications with custom middleware ordering

Set `attachRoutes: false` before mounting the returned router yourself:

```typescript
const {app, router} = await bootstrapControllers({
  attachRoutes: false,
  controllers: [UserController],
});

// Application middleware that must run before controller routes.
app.use(requestLogger);
app.use(authentication);

app.use(router.routes());
app.use(router.allowedMethods());
```

`attachRoutes` controls only mounting and middleware order. Amala still discovers controllers and generates routes during `bootstrapControllers()` when it is `false`.

## Watch for duplicate mounting

An application that previously omitted `attachRoutes` and then mounted the returned router manually must add `attachRoutes: false` or remove its manual mounting calls. Do not register the same router middleware twice.

## Everything else is unchanged

- Koa state and context-extension generics continue to work as introduced in v12.
- The optional `controllerFactory` remains a construction hook; Amala does not add a dependency-injection container.
- Parameter decorators still use TypeScript's legacy decorator metadata implementation.
- `attachRoutes: false` remains fully supported for established Koa composition patterns.
