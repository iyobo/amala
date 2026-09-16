---
sidebar_position: 1
sidebar_label: bootstrapControllers
---

# `bootstrapControllers(options)`

Initializes controller routes and returns the Koa app and router used by Amala.

Its generic signature is `bootstrapControllers<StateT, ContextT>(options)`. It resolves to the typed `app` and `router` that Amala configured.

Only `controllers` is required.

```typescript
const {app, router} = await bootstrapControllers({
  controllers: [HealthController, UserController],
});
```

## Core options

| Option | Default | Purpose |
| --- | --- | --- |
| `controllers` | required | Trusted controller classes or glob strings to load. Prefer explicit classes. |
| `controllerFactory` | Per-request `new ControllerClass(ctx)` | Override how Amala constructs a controller. |
| `app` | new Koa app | Use an existing Koa application. |
| `router` | new Koa router | Use an existing `@koa/router` instance. |
| `basePath` | `''` | Prefix added before version, controller, and OpenAPI paths. |
| `attachRoutes` | `true` | Attach `router.routes()` and `router.allowedMethods()` automatically. Set to `false` for manual middleware ordering. |
| `flow` | `[]` | Global Koa middleware registered before generated routes. |
| `diagnostics` | `false` | Log controller and route registration details. Avoid in noisy production logs. |

Controller glob strings are executed with `require()` at startup. Never derive them from request data or another untrusted source.

## Typed Koa context

Provide Koa's state and context-extension types once and Amala carries them through its context-bearing APIs:

```typescript
interface AppState {
  user?: User;
  services: Services;
}

interface ContextExtensions {
  requestId: string;
}

const app = new Koa<AppState, ContextExtensions>();

const {router} = await bootstrapControllers({
  app,
  controllers: [UserController],
  flow: [async (ctx, next) => {
    ctx.state.services = services;
    ctx.requestId = crypto.randomUUID();
    await next();
  }],
});
```

The supplied app lets TypeScript infer `AppState` and `ContextExtensions`. Alternatively, call `bootstrapControllers<AppState, ContextExtensions>(options)` when Amala should create the app.

The same types appear in global middleware, `@Flow`, `controllerFactory`, `errorHandler`, the body parser's `onError`, and the returned app and router. Undeclared custom properties are rejected at compile time by default.

## Versioning

Versioning is enabled by default with version `1`.

```typescript
const {app} = await bootstrapControllers({
  controllers: [UserController],
  versions: {
    1: 'Version 1 will be removed on 2027-01-01.',
    2: true,
  },
});

app.listen(3000);
```

This registers compatible endpoints under `/v1` and `/v2`. Amala includes the message in the `Deprecation` response header for version 1 routes. A simple array such as `versions: [1, 2]` enables versions without deprecation messages. Set `disableVersioning: true` to omit the `/v...` path segment. `@Version` handlers are skipped when built-in versioning is disabled.

## Request parsing

Amala configures `koa-body` unless `bodyParser` is `false`.

```typescript
const {app} = await bootstrapControllers({
  bodyParser: {
    formLimit: '56kb',
    jsonLimit: '1mb',
    multipart: false,
    textLimit: '56kb',
  },
  controllers: [UserController],
});

app.listen(3000);
```

Multipart parsing remains enabled by default for compatibility. Explicitly set `multipart: false` when uploads are not needed. When uploads are enabled, configure `formidable` limits and validate file content in application code.

Set `bodyParser: false` if the application installs its own parser.

## class-validator options

`validatorOptions` is passed to class-validator whenever Amala receives a decorated class input:

```typescript
const {app} = await bootstrapControllers({
  controllers: [UserController],
  validatorOptions: {
    forbidNonWhitelisted: true,
    whitelist: true,
  },
});

app.listen(3000);
```

Interfaces do not exist at runtime and cannot be validated. Use a class with class-validator decorators.

`validatorOptions` applies only to class-validator inputs. New endpoints can instead pass any Standard Schema validator directly to `@Body`, `@Query`, or `@Params`; see [Validate requests](../validation.md).

## Controller construction

By default, Amala constructs a fresh controller for each request and passes the typed Koa context to its constructor. Applications can place their services on typed Koa state:

```typescript
type AppContext = AmalaContext<AppState, ContextExtensions>;

class UserController {
  constructor(private readonly ctx: AppContext) {}

  @Get('/')
  list() {
    return this.ctx.state.services.users.list();
  }
}

const {app} = await bootstrapControllers<AppState, ContextExtensions>({
  controllers: [UserController],
});

app.listen(3000);
```

The optional `controllerFactory` remains available when an application needs custom construction. It receives the controller class and typed context, may return a promise, and runs once per request. Amala does not provide or manage a dependency-injection container, binding registry, or service lifecycle.

## OpenAPI

OpenAPI generation is enabled by default.

```typescript
const {app} = await bootstrapControllers({
  controllers: [UserController],
  openAPI: {
    enabled: true,
    publicURL: 'https://api.example.com',
    specPath: 'docs',
    webPath: 'swagger',
    spec: {
      info: {
        title: 'Example API',
        version: '1.0.0',
      },
    },
  },
});

app.listen(3000);
```

`specPath` and `webPath` are appended to `basePath`. With `basePath: '/api'`, their defaults are `/api/docs` and `/api/swagger`. `publicURL` defaults to the current origin.

In the generated document, each server URL owns the API `basePath` and version prefix. Paths remain relative to that server, preventing clients from repeating the base path.

Set `openAPI: {enabled: false}` to disable both endpoints. In production, disable them or apply access-control middleware if the API inventory is sensitive.

## HTTP security headers

Set `useHelmet: true` to add Koa Helmet to the global middleware flow, or pass Helmet options:

```typescript
const {app} = await bootstrapControllers({
  controllers: [UserController],
  useHelmet: {
    contentSecurityPolicy: false,
  },
});

app.listen(3000);
```

Review Helmet options for your application, especially when serving Swagger UI from the same process.

## CORS

CORS is enabled by default using `@koa/cors` defaults. Public applications should configure an explicit allowed origin or disable Amala's CORS middleware and install their own policy:

```typescript
const {app} = await bootstrapControllers({
  controllers: [UserController],
  cors: {
    enabled: true,
    opts: {
      credentials: true,
      origin: 'https://app.example.com',
    },
  },
});

app.listen(3000);
```

Do not combine credentialed requests with a wildcard origin.

## Error handling

The default handler formats Boom errors, returns validation details for client errors, and hides details for server errors. Override it with `errorHandler` when you need structured logging or a different response envelope:

```typescript
const {app} = await bootstrapControllers({
  controllers: [UserController],
  errorHandler: async (error, ctx) => {
    const errorId = crypto.randomUUID();

    // Narrow and redact the unknown error inside this reporter.
    await reportErrorSafely({error, errorId});

    ctx.status = 500;
    ctx.body = {error: 'Internal Server Error', errorId};
  },
});

app.listen(3000);
```

The error value is `unknown`; narrow it before accessing error-specific properties. Keep secrets, request bodies, authorization headers, and raw third-party URLs out of error logs.

## Bring your own app or router

```typescript
const {app, router} = await bootstrapControllers({
  app: koaApp,
  router: koaRouter,
  controllers: [HealthController],
});
```

The same objects are returned after Amala registers its middleware and routes.

Generated routes are mounted on the app by default. When `attachRoutes: false` is used, route generation is unchanged and the returned router can be mounted manually wherever the application needs it.
