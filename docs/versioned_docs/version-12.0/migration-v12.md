---
sidebar_position: 1
sidebar_label: Migrate to v12
---

# Migrate to Amala 12

Amala 12 makes Koa state and context extensions type-safe throughout the framework. It does not change Koa's runtime model or add a dependency-injection system.

## What changed

Amala's context-bearing APIs now share two generic parameters:

1. The type stored in `ctx.state`.
2. Properties added directly to `ctx` by application middleware.

The generics flow through `bootstrapControllers`, the returned Koa application and router, global and decorated middleware, `controllerFactory`, body-parser error handling, and application error handling.

Safe property-free types are now the defaults. Previous releases inherited Koa's `DefaultState` and `DefaultContext`, whose index signatures allowed arbitrary properties to become `any`.

## Define the application contract

```typescript
import Koa from 'koa';
import {
  AmalaContext,
  AmalaMiddleware,
  bootstrapControllers,
} from 'amala';

interface AppState {
  user?: {
    id: string;
  };
  services: Services;
}

interface ContextExtensions {
  requestId: string;
}

const app = new Koa<AppState, ContextExtensions>();

const requestContext: AmalaMiddleware<AppState, ContextExtensions> =
  async (ctx, next) => {
    ctx.state.services = services;
    ctx.requestId = crypto.randomUUID();
    await next();
  };

await bootstrapControllers({
  app,
  controllers: [UserController],
  flow: [requestContext],
});
```

Supplying the typed Koa application lets TypeScript infer both generics. If Amala creates the application, provide them directly:

```typescript
await bootstrapControllers<AppState, ContextExtensions>({
  controllers: [UserController],
});
```

Use the exported context type wherever the complete Koa context is needed:

```typescript
type AppContext = AmalaContext<AppState, ContextExtensions>;
```

## Update error handlers

The error value is now `unknown`. Narrow it before reading error-specific fields:

```typescript
errorHandler: async (error, ctx) => {
  const message = error instanceof Error
    ? error.message
    : 'Internal Server Error';

  ctx.status = 500;
  ctx.body = {message};
}
```

This prevents thrown strings, objects, or other non-Error values from being treated as trusted error instances.

## Koa's open context remains available

The new types prevent accidental undeclared access; they do not freeze the runtime object. JavaScript middleware can still add properties to Koa context.

Applications that intentionally depend on Koa's globally augmented, open-ended defaults can opt back into them explicitly:

```typescript
await bootstrapControllers<Koa.DefaultState, Koa.DefaultContext>({
  controllers: [LegacyController],
});
```

Prefer an explicit application contract for new code.

## Dependency injection

Amala remains container-agnostic. It does not include a binding registry, service locator, or container lifecycle. Applications can expose services through their typed Koa state or continue using the optional `controllerFactory` hook.

## Runtime validation is unchanged

Context generics are compile-time safeguards. They do not authenticate `ctx.state.user` or validate values produced by middleware. Continue validating attacker-controlled body, query, path, header, and upload data at runtime, and establish identity through trusted authentication middleware.

## Decorator configuration is unchanged

Amala 12 still uses TypeScript's legacy decorator implementation because its argument injection API depends on parameter decorators and emitted parameter-type metadata. Keep `experimentalDecorators` and `emitDecoratorMetadata` enabled. A future standard-decorator design is separate from this release.
