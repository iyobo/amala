# Amala

Amala is a decorator-based TypeScript framework for building REST APIs on Koa. It turns controller classes into routes, injects request data into handler arguments, validates class-based inputs, supports API versioning, and can publish an OpenAPI document with Swagger UI.

[Read the documentation](https://amalajs.com/docs/intro) · [Get started](https://amalajs.com/docs/getting-started) · [Security guide](https://amalajs.com/docs/security) · [Report an issue](https://github.com/iyobo/amala/issues)

Upgrading from v11? Read the [v12 migration guide](https://amalajs.com/docs/migration-v12). The documentation site also preserves the complete v11 reference.

## Why Amala?

- **Typed controller routes.** Define endpoints with `@Controller`, `@Get`, `@Post`, and the other HTTP decorators.
- **Focused handler inputs.** Inject only the body, query value, path parameter, state, session, or Koa context a handler needs.
- **Validation at the boundary.** Use `class-validator` classes for request-body, query, and path inputs.
- **Built-in versioning and API discovery.** Serve multiple API versions and generate an OpenAPI 3 document with Swagger UI.
- **Typed Koa context.** Define application state and context extensions once and preserve them through middleware, factories, error handlers, and bootstrap results.
- **Koa stays accessible.** Bring an existing app, router, and middleware when you need lower-level control.

## Requirements

- Node.js 22 or newer
- TypeScript with `experimentalDecorators` and `emitDecoratorMetadata` enabled

Amala's parameter decorators rely on TypeScript's legacy decorator metadata. The standard decorator implementation does not yet support parameter decorators or emit design-time parameter types.

## Quick start

Install the framework:

```bash
npm install amala
```

Create `src/main.ts`:

```typescript
import {
  Controller,
  Get,
  bootstrapControllers,
} from 'amala';

@Controller('/health')
class HealthController {
  @Get('/')
  status() {
    return {status: 'ok'};
  }
}

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

Use this compiler configuration as a baseline:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "module": "commonjs",
    "skipLibCheck": true,
    "target": "ES2018"
  }
}
```

Start the app, then request `GET http://localhost:3000/api/v1/health`. API versioning is enabled by default; set `disableVersioning: true` if you want `/api/health` instead.

## Type Koa state and context

Amala 12 preserves Koa's existing state and context-extension generics without adding a new runtime abstraction:

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

await bootstrapControllers({
  app,
  controllers: [HealthController],
  flow: [requestContext],
});
```

These types are compile-time safeguards. Application middleware still owns the runtime values placed on Koa context and state.

For a generated starter project, run:

```bash
npm create amala-app@latest my-api
```

## A validated endpoint

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
class UserController {
  @Post('/')
  create(@Body({required: true}) input: CreateUserInput) {
    return input;
  }
}
```

Amala returns a `422` response when class-validator rejects the input. Authentication and authorization remain application responsibilities; add them with Koa middleware and `@Flow`.

## Important defaults

- Routes use version `v1` unless versioning is disabled.
- CORS and the OpenAPI/Swagger endpoints are enabled by default.
- Multipart parsing is enabled for backward compatibility. Disable it when uploads are not required and set explicit file limits when they are.
- `attachRoutes` is `false` by default so applications can place middleware before the router.

Review the [production security guide](https://amalajs.com/docs/security) before exposing an Amala API publicly.

## Development

```bash
npm ci
npm test
npm run build
```

The documentation site requires Node.js 20 or newer:

```bash
cd docs
npm ci
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the complete contribution workflow and [SECURITY.md](SECURITY.md) for private vulnerability reporting guidance.

## License

[MIT](LICENSE)
