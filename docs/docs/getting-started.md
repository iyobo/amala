---
sidebar_position: 2
sidebar_label: Getting started
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  },
  "include": ["src/**/*.ts"]
}
```

Both decorator settings are required. Without emitted type metadata, Amala cannot transform and validate class-based handler arguments.

These settings select TypeScript's legacy decorator implementation. Standard decorators do not currently support parameter decorators such as `@Body()` or automatically emit the parameter types Amala needs.

## Create and bootstrap the app

Start with the controller, then open the `main.ts` tab to see how it becomes a running application:

<Tabs groupId="first-app">
  <TabItem value="controller" label="HealthController.ts" default>

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

  </TabItem>
  <TabItem value="main" label="main.ts">

```typescript
import {bootstrapControllers} from 'amala';
import {HealthController} from './controllers/HealthController';

async function start() {
  const {app} = await bootstrapControllers({
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

  </TabItem>
</Tabs>

Compile and run the application with the scripts used by your project. Request:

```text
GET http://localhost:3000/api/v1/health
```

The response is:

```json
{"status":"ok"}
```

Version `v1` is enabled by default. To serve `GET /api/health`, set `disableVersioning: true`. Generated routes are attached automatically in Amala 13, so the returned app is ready to listen.

## Type application context

Koa accepts separate types for `ctx.state` and properties added directly to `ctx`. Amala preserves both:

```typescript
import Koa from 'koa';
import {AmalaMiddleware, bootstrapControllers} from 'amala';

interface AppState {
  user?: User;
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

async function start() {
  await bootstrapControllers({
    app,
    controllers: [HealthController],
    flow: [requestContext],
  });

  app.listen(3000);
}

void start();
```

The typed application lets `bootstrapControllers` infer both generic arguments. When Amala creates the app, provide them explicitly with `bootstrapControllers<AppState, ContextExtensions>(...)`.

These generics catch accidental undeclared context access at compile time. They do not validate middleware output or establish an authenticated identity.

## Add validation

Create `src/controllers/UserController.ts`:

<Tabs groupId="validation-example">
  <TabItem value="controller" label="UserController.ts" default>

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
  email!: string;

  @IsString()
  displayName!: string;
}

@Controller('/users')
export class UserController {
  @Post('/')
  create(@Body({required: true}) input: CreateUserInput) {
    return input;
  }
}
```

  </TabItem>
  <TabItem value="main" label="main.ts">

```typescript
import {bootstrapControllers} from 'amala';
import {HealthController} from './controllers/HealthController';
import {UserController} from './controllers/UserController';

async function start() {
  const {app} = await bootstrapControllers({
    controllers: [HealthController, UserController],
    validatorOptions: {
      forbidNonWhitelisted: true,
      whitelist: true,
    },
  });

  app.listen(3000);
}

void start();
```

  </TabItem>
</Tabs>

Register `UserController` beside `HealthController`. Amala transforms the JSON body into `CreateUserInput`, runs class-validator, and returns `422` when validation fails.

For strict object contracts, pass class-validator options during bootstrap as shown above.

## Add middleware

Use `@Flow` for controller- or endpoint-level Koa middleware:

```typescript
import {
  AmalaMiddleware,
  Body,
  bootstrapControllers,
  Controller,
  Flow,
  Post,
} from 'amala';

const requireUser: AmalaMiddleware<AppState> = async (ctx, next) => {
  if (!ctx.state.user) {
    ctx.throw(401, 'Authentication required');
  }

  await next();
};

@Controller('/users')
class UserController {
  @Post('/')
  @Flow(requireUser)
  create(@Body({required: true}) input: CreateUserInput) {
    return input;
  }
}

async function start() {
  const {app} = await bootstrapControllers<AppState>({
    controllers: [UserController],
  });

  app.listen(3000);
}

void start();
```

Authentication and authorization are not built into Amala. Your middleware must establish identity and enforce access before the handler runs.

## OpenAPI and Swagger

OpenAPI is enabled by default. With `basePath: '/api'`, Amala serves:

- OpenAPI JSON at `GET /api/docs`
- Swagger UI at `GET /api/swagger`

Set a public origin when the generated server URLs need an absolute URL:

```typescript
const {app} = await bootstrapControllers({
  controllers: [HealthController, UserController],
  openAPI: {
    enabled: true,
    publicURL: 'https://api.example.com',
  },
});

app.listen(3000);
```

An omitted `publicURL` keeps Swagger on the same origin. Disable or protect these endpoints when your route inventory should not be public.

## Attach routes manually

Amala attaches generated routes by default. Set `attachRoutes: false` when you need to insert application middleware at a precise point before the router:

```typescript
const {app, router} = await bootstrapControllers({
  attachRoutes: false,
  basePath: '/api',
  controllers: [HealthController, UserController],
});

app.use(yourMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());
```

The option controls only where router middleware is mounted. Controller discovery and route generation still happen during bootstrap.

Continue with the [`bootstrapControllers` reference](./api-spec/bootstrap-controllers.md) and the [production security guide](./security.md).
