---
sidebar_position: 2
sidebar_label: Getting started
---

# Getting started

This guide creates a small versioned API with one controller and a validated endpoint.

## Requirements

- Node.js 22 or newer
- A TypeScript project using CommonJS-compatible output
- `experimentalDecorators` and `emitDecoratorMetadata` enabled

## Install Amala

Add Amala to an existing project:

```bash
npm install amala
```

Or generate a starter application:

```bash
npm create amala-app@latest my-api
```

The rest of this guide shows the manual setup so each moving part is visible.

## Configure TypeScript

Use this as a baseline `tsconfig.json`:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "module": "commonjs",
    "outDir": "dist",
    "target": "ES2018"
  },
  "include": ["src/**/*.ts"]
}
```

Both decorator settings are required. Without emitted type metadata, Amala cannot transform and validate class-based handler arguments.

These settings select TypeScript's legacy decorator implementation. Standard decorators do not currently support parameter decorators such as `@Body()` or automatically emit the parameter types Amala needs.

## Create a controller

Create `src/controllers/HealthController.ts`:

```typescript
import {Controller, Get} from 'amala';

@Controller('/health')
export class HealthController {
  @Get('/')
  status() {
    return {status: 'ok'};
  }
}
```

## Bootstrap the app

Create `src/main.ts`:

```typescript
import {bootstrapControllers} from 'amala';
import {HealthController} from './controllers/HealthController';

async function start() {
  const {app} = await bootstrapControllers({
    attachRoutes: true,
    basePath: '/api',
    controllers: [HealthController],
    useHelmet: true,
  });

  app.listen(3000, () => {
    console.log('API listening at http://localhost:3000');
  });
}

void start();
```

Compile and run the application with the scripts used by your project. Request:

```text
GET http://localhost:3000/api/v1/health
```

The response is:

```json
{"status":"ok"}
```

Version `v1` is enabled by default. To serve `GET /api/health`, set `disableVersioning: true`.

## Add validation

Create `src/controllers/UserController.ts`:

```typescript
import {
  Body,
  Controller,
  IsEmail,
  IsString,
  Post,
} from 'amala';

class CreateUserInput {
  @IsEmail()
  email: string;

  @IsString()
  displayName: string;
}

@Controller('/users')
export class UserController {
  @Post('/')
  create(@Body({required: true}) input: CreateUserInput) {
    return input;
  }
}
```

Register `UserController` beside `HealthController`. Amala transforms the JSON body into `CreateUserInput`, runs class-validator, and returns `422` when validation fails.

For strict object contracts, pass class-validator options during bootstrap:

```typescript
validatorOptions: {
  forbidNonWhitelisted: true,
  whitelist: true,
}
```

## Add middleware

Use `@Flow` for controller- or endpoint-level Koa middleware:

```typescript
const requireUser = async (ctx, next) => {
  if (!ctx.state.user) {
    ctx.throw(401, 'Authentication required');
  }

  await next();
};

@Post('/')
@Flow(requireUser)
create(@Body({required: true}) input: CreateUserInput) {
  return input;
}
```

Authentication and authorization are not built into Amala. Your middleware must establish identity and enforce access before the handler runs.

## OpenAPI and Swagger

OpenAPI is enabled by default. With `basePath: '/api'`, Amala serves:

- OpenAPI JSON at `GET /api/docs`
- Swagger UI at `GET /api/swagger`

Set a public origin when the generated server URLs need an absolute URL:

```typescript
openAPI: {
  enabled: true,
  publicURL: 'https://api.example.com',
}
```

An omitted `publicURL` keeps Swagger on the same origin. Disable or protect these endpoints when your route inventory should not be public.

## Attach routes manually

`attachRoutes` is `false` by default. That lets you insert your own middleware before the generated router:

```typescript
const {app, router} = await bootstrapControllers({
  basePath: '/api',
  controllers: [HealthController, UserController],
});

app.use(yourMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());
```

Continue with the [`bootstrapControllers` reference](./api-spec/bootstrap-controllers.md) and the [production security guide](./security.md).
