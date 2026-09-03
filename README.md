# Amala

Amala is a decorator-based TypeScript framework for building REST APIs on Koa. It turns controller classes into routes, injects request data into handler arguments, validates class-based inputs, supports API versioning, and can publish an OpenAPI document with Swagger UI.

[Read the documentation](https://amalajs.com/docs/intro) · [Get started](https://amalajs.com/docs/getting-started) · [Security guide](https://amalajs.com/docs/security) · [Report an issue](https://github.com/iyobo/amala/issues)

Upgrading from v10? Read the [v11 migration guide](https://amalajs.com/docs/migration-v11).

## Why Amala?

- **Typed controller routes.** Define endpoints with `@Controller`, `@Get`, `@Post`, and the other HTTP decorators.
- **Focused handler inputs.** Inject only the body, query value, path parameter, state, session, or Koa context a handler needs.
- **Validation at the boundary.** Use `class-validator` classes for request-body, query, and path inputs.
- **Built-in versioning and API discovery.** Serve multiple API versions and generate an OpenAPI 3 document with Swagger UI.
- **Container-neutral dependency injection.** Resolve request-scoped controller instances with an optional controller factory.
- **Koa stays accessible.** Bring an existing app, router, and middleware when you need lower-level control.

## Requirements

- Node.js 18 or newer
- TypeScript with `experimentalDecorators` and `emitDecoratorMetadata` enabled

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
    "target": "ES2018"
  }
}
```

Start the app, then request `GET http://localhost:3000/api/v1/health`. API versioning is enabled by default; set `disableVersioning: true` if you want `/api/health` instead.

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
