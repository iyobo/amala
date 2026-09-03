---
sidebar_position: 1
sidebar_label: Introduction
slug: /intro
---

# Build typed Koa APIs with decorators

Amala is a TypeScript framework for defining Koa routes as controller classes. It adds a focused programming model—routing decorators, request-data injection, validation, API versioning, and OpenAPI generation—while returning the underlying Koa app and router whenever you need direct control.

```typescript
@Controller('/users')
class UserController {
  @Get('/:id')
  getOne(@Params('id') id: string) {
    return {id};
  }
}
```

With `basePath: '/api'` and the default version configuration, this handler serves `GET /api/v1/users/:id`.

## What Amala provides

- Decorators for controllers, HTTP methods, middleware, and version constraints.
- Argument injection for bodies, path parameters, query values, headers, state, sessions, files, requests, responses, and the full Koa context.
- Runtime transformation and validation of decorated class inputs through `class-transformer` and `class-validator`.
- Built-in API version routing, including deprecation headers.
- Generated OpenAPI 3 JSON and an optional Swagger UI.
- Optional Koa Helmet, CORS, and body-parser setup.

## What stays in your application

Amala intentionally does not choose your database, authentication system, authorization policy, session strategy, observability stack, or deployment platform. Those remain Koa middleware and application concerns.

In particular, `@CurrentUser()` only reads `ctx.state.user`; it does not authenticate the request. Protect the endpoint with authentication and authorization middleware before using that value.

## A good fit when

Amala works well when you want class-based TypeScript controllers, need direct access to Koa, and prefer a small framework layer over a fully managed application platform. It is especially useful for versioned REST APIs and services whose request contracts can be expressed as validation classes.

If you need multiple mutually untrusted APIs in one process, note that Amala's decorator registry is process-wide. Isolate those APIs in separate processes.

## Next steps

- Follow [Getting started](./getting-started.md) to run a first endpoint.
- Review [`bootstrapControllers`](./api-spec/bootstrap-controllers.md) for configuration and defaults.
- Browse the [decorator reference](./api-spec/decorators.md).
- Complete the [production security checklist](./security.md) before exposing an API publicly.

Amala is open source under the MIT license. Contributions are welcome on [GitHub](https://github.com/iyobo/amala).
