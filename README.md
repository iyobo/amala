# Amala

Amala is a small, decorator-based TypeScript framework for building REST APIs on Koa. Controllers become routes, decorated arguments receive request data, class-based inputs are validated, and Koa remains available whenever the application needs it.

[Documentation](https://amalajs.com/docs/intro) · [Getting started](https://amalajs.com/docs/getting-started) · [API reference](https://amalajs.com/docs/api-spec/bootstrap-controllers) · [Security guide](https://amalajs.com/docs/security) · [Report an issue](https://github.com/iyobo/amala/issues)

Upgrading from v12? Read the [v13 migration guide](https://amalajs.com/docs/migration-v13). Older documentation remains available from the version selector.

## Hello, world

Install Amala in a TypeScript project:

```bash
npm install amala
npm install --save-dev typescript
```

Create `src/main.ts`:

```typescript
import {bootstrapControllers, Controller, Get} from 'amala';

@Controller('/')
class HelloController {
  @Get('/')
  hello() {
    return {message: 'Hello, world!'};
  }
}

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [HelloController],
    disableVersioning: true, // Keep the first URL at `/` instead of `/v1/`.
  });

  app.listen(3000);
}

void main();
```

Use this baseline `tsconfig.json`:

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

Compile, start, and request the route:

```bash
npx tsc
node dist/main.js
curl http://localhost:3000
```

```json
{"message":"Hello, world!"}
```

Amala 13 attaches generated routes to the Koa app by default. That makes the result of `bootstrapControllers()` ready to listen without another router setup step.

## Why Amala?

- **Controller routes:** define endpoints with `@Controller`, `@Get`, `@Post`, and the other HTTP decorators.
- **Focused arguments:** inject only the body, query value, path parameter, header, state, or Koa context a handler needs.
- **Runtime validation:** transform and validate class-based request inputs with class-validator.
- **Typed Koa context:** carry application state and context extensions through middleware, controller construction, error handling, and bootstrap results.
- **Versioning and discovery:** serve multiple API versions and generate an OpenAPI document with Swagger UI.
- **Koa-native composition:** bring an existing app, use ordinary Koa middleware, or mount the generated router yourself.

Amala intentionally does not provide authentication, authorization, a dependency-injection container, or a service lifecycle. Those remain application and Koa middleware concerns.

## Requirements

- Node.js 22 or newer
- TypeScript with `experimentalDecorators` and `emitDecoratorMetadata` enabled

Amala currently uses TypeScript's legacy decorator implementation. Its argument injection API depends on parameter decorators and emitted parameter-type metadata, which standard decorators do not yet provide.

For a generated starter application instead of manual setup, run:

```bash
npm create amala-app@latest my-api
```

## Controllers and routes

`@Controller()` supplies the shared route prefix. HTTP decorators register controller methods beneath it:

```typescript
import {
  bootstrapControllers,
  Controller,
  Delete,
  Get,
  Params,
  Patch,
  Post,
  Put,
  Query,
} from 'amala';

@Controller('/users')
class UserController {
  @Get('/')
  list(@Query('page') page?: string) {
    return {page: page ?? '1'};
  }

  @Get('/:id')
  getOne(@Params('id') id: string) {
    return {id};
  }

  @Post('/')
  create() {}

  @Put('/:id')
  replace(@Params('id') id: string) {}

  @Patch('/:id')
  update(@Params('id') id: string) {}

  @Delete('/:id')
  remove(@Params('id') id: string) {}
}

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [UserController],
  });

  app.listen(3000);
}

void main();
```

With the default versioning configuration, these routes live below `/v1/users`. Set `disableVersioning: true` when the application should expose `/users` directly.

## Request arguments

Argument decorators keep handlers focused on the part of the Koa request they actually use:

| Decorator | Injected value |
| --- | --- |
| `@Body()` / `@Body('field')` | The complete request body or one field |
| `@Params()` / `@Params('id')` | All path parameters or one parameter |
| `@Query()` / `@Query('q')` | The parsed query or one query value |
| `@Header()` / `@Header('name')` | All request headers or one header |
| `@State()` / `@State('name')` | Koa state or one state value |
| `@CurrentUser()` | `ctx.state.user` |
| `@Session()` / `@Session('name')` | The configured Koa session or one value |
| `@File()` | Uploaded file data from koa-body or `@koa/multer` |
| `@Req()` / `@Res()` | The Koa request or response |
| `@Ctx()` / `@Ctx('name')` | The complete Koa context or one context property |

For example:

```typescript
import {
  bootstrapControllers,
  Controller,
  Get,
  Header,
  Params,
  Query,
} from 'amala';

@Controller('/users')
class UserController {
  @Get('/:id')
  findOne(
    @Params('id') id: string,
    @Query('include') include?: string,
    @Header('x-request-id') requestId?: string,
  ) {
    return {id, include, requestId};
  }
}

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [UserController],
  });

  app.listen(3000);
}

void main();
```

Prefer the narrowest decorator that supplies what a handler needs. It reduces coupling to Koa and makes controller methods easier to test.

## Validate request data

Use classes—not interfaces—for inputs that need runtime validation:

```typescript
import {
  Body,
  bootstrapControllers,
  Controller,
  IsEmail,
  IsString,
  Length,
  Post,
} from 'amala';

class CreateUserInput {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(2, 80)
  displayName!: string;
}

@Controller('/users')
class UserController {
  @Post('/')
  create(@Body({required: true}) input: CreateUserInput) {
    return input;
  }
}

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [UserController],
    validatorOptions: {
      forbidNonWhitelisted: true,
      whitelist: true,
    },
  });

  app.listen(3000);
}

void main();
```

Amala transforms the JSON body into `CreateUserInput`, runs class-validator, and returns `422` when validation fails. The bootstrap options above also reject unexpected fields.

Validation establishes shape, not identity or permission. Continue to authorize every protected operation against trusted server-side state.

## Type the request context

Koa allows middleware to place application values in `ctx.state` or directly on `ctx`. Amala preserves separate types for both without introducing another runtime abstraction.

```typescript
import Koa from 'koa';
import {
  AmalaContext,
  AmalaMiddleware,
  bootstrapControllers,
  Controller,
  Get,
} from 'amala';

interface User {
  id: string;
  name: string;
}

interface Services {
  users: {
    list(): Promise<User[]>;
  };
}

interface AppState {
  services: Services;
  user?: User;
}

interface ContextExtensions {
  requestId: string;
}

type AppContext = AmalaContext<AppState, ContextExtensions>;

const services: Services = {
  users: {
    async list() {
      return [];
    },
  },
};

const requestContext: AmalaMiddleware<AppState, ContextExtensions> =
  async (ctx, next) => {
    // `ctx.state` follows the AppState contract.
    ctx.state.services = services;

    // Direct additions to Koa context use ContextExtensions.
    ctx.requestId = crypto.randomUUID();

    await next();
  };

@Controller('/users')
class UserController {
  constructor(private readonly ctx: AppContext) {}

  @Get('/')
  async list() {
    return {
      requestId: this.ctx.requestId,
      users: await this.ctx.state.services.users.list(),
    };
  }
}

async function main() {
  const app = new Koa<AppState, ContextExtensions>();

  await bootstrapControllers({
    app, // The Koa generics let Amala infer both context types.
    controllers: [UserController],
    flow: [requestContext],
  });

  app.listen(3000);
}

void main();
```

When Amala creates the Koa app, provide the types directly:

```typescript
async function main() {
  const {app} = await bootstrapControllers<AppState, ContextExtensions>({
    controllers: [UserController],
    flow: [requestContext],
  });

  app.listen(3000);
}

void main();
```

These generics prevent accidental undeclared property access during compilation. They do not freeze the context object, validate middleware output, or prove that `ctx.state.user` was authenticated.

Amala does not need a binding registry for this. The application creates its services, and ordinary Koa middleware exposes them through the typed request context.

## Add authentication middleware

Authentication and authorization belong in Koa middleware. `@Flow()` applies that middleware globally, to a controller, or to one endpoint:

```typescript
import {
  AmalaMiddleware,
  bootstrapControllers,
  Controller,
  CurrentUser,
  Flow,
  Get,
} from 'amala';

const requireUser: AmalaMiddleware<AppState, ContextExtensions> =
  async (ctx, next) => {
    if (!ctx.state.user) {
      ctx.throw(401, 'Authentication required');
    }

    await next();
  };

@Controller('/account')
@Flow(requireUser)
class AccountController {
  @Get('/')
  profile(@CurrentUser() user: User) {
    return user;
  }
}

async function main() {
  const {app} = await bootstrapControllers<AppState, ContextExtensions>({
    controllers: [AccountController],
  });

  app.listen(3000);
}

void main();
```

`@CurrentUser()` only reads `ctx.state.user`; it does not authenticate the request. A trusted middleware must verify the credential and establish that state first.

## Version an API

Version `1` is active by default. Configure additional versions at bootstrap and use `@Version()` when one handler belongs to a particular version:

```typescript
import {bootstrapControllers, Controller, Get, Version} from 'amala';

@Controller('/users')
class UserController {
  @Get('/')
  @Version('1', 'Use version 2.')
  listV1() {
    return {version: 1};
  }

  @Get('/')
  listCurrent() {
    return {version: 2};
  }
}

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [UserController],
    versions: {
      1: 'Version 1 will be removed on 2027-01-01.',
      2: true,
    },
  });

  app.listen(3000);
}

void main();
```

The version-specific handler serves `/v1`; the unversioned fallback serves the remaining configured versions. Deprecation messages are returned in the `Deprecation` response header.

## OpenAPI and Swagger

OpenAPI generation is enabled by default. With `basePath: '/api'`, Amala serves:

- OpenAPI JSON at `GET /api/docs`
- Swagger UI at `GET /api/swagger`

Customize the document during bootstrap:

```typescript
async function main() {
  const {app} = await bootstrapControllers({
    controllers: [UserController],
    openAPI: {
      enabled: true,
      publicURL: 'https://api.example.com',
      spec: {
        info: {
          title: 'Example API',
          version: '1.0.0',
        },
      },
    },
  });

  app.listen(3000);
}

void main();
```

Omit `publicURL` to keep Swagger on the same origin. Disable or protect these endpoints when the route inventory should not be public by passing `openAPI: {enabled: false}` to `bootstrapControllers()`.

## Handle file uploads

`@File()` supports files parsed by Amala's default koa-body middleware and files supplied by `@koa/multer`:

```typescript
import {bootstrapControllers, Controller, File, Post} from 'amala';

@Controller('/users')
class UserController {
  @Post('/avatar')
  uploadAvatar(@File() file: unknown) {
    // Validate the actual content before storing or processing an upload.
    return {received: Boolean(file)};
  }
}

async function main() {
  const {app} = await bootstrapControllers({
    bodyParser: {
      multipart: true,
      formidable: {
        maxFileSize: 5 * 1024 * 1024,
        maxFiles: 1,
      },
    },
    controllers: [UserController],
  });

  app.listen(3000);
}

void main();
```

Multipart parsing is enabled by default for backward compatibility. The example makes that choice explicit and sets limits. Pass `bodyParser: {multipart: false}` when the application does not accept uploads.

When uploads are enabled, configure `formidable.maxFileSize`, `maxFiles`, and field limits. Generate server-side filenames, keep uploads outside the public web root, and inspect content instead of trusting the supplied filename or `Content-Type`.

## Control middleware and route order

Amala 13 mounts generated routes automatically. Set `attachRoutes: false` when an established Koa application needs to decide exactly where the router belongs:

```typescript
async function main() {
  const {app, router} = await bootstrapControllers({
    attachRoutes: false,
    controllers: [UserController],
  });

  // Middleware registered here runs before controller routes.
  app.use(requestLogger);
  app.use(rateLimiter);

  // Mount Amala's already-generated router at the chosen point.
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(3000);
}

void main();
```

`attachRoutes` controls mounting and middleware order. Controller discovery and route generation still happen during `bootstrapControllers()` in both modes.

You can also supply an existing typed app or router:

```typescript
async function main() {
  const {app, router} = await bootstrapControllers({
    app: koaApp,
    router: koaRouter,
    controllers: [UserController],
  });

  app.listen(3000);
}

void main();
```

## Customize controller construction

Amala creates a fresh controller for every request and passes the Koa context to its constructor. The optional `controllerFactory` hook is available when an application needs a different construction strategy:

```typescript
async function main() {
  const {app} = await bootstrapControllers({
    controllers: [UserController],
    controllerFactory: async (ControllerClass, ctx) => {
      return new ControllerClass(ctx);
    },
  });

  app.listen(3000);
}

void main();
```

The hook runs once per request and may return a promise. Amala does not provide or manage a dependency-injection container, binding registry, or service lifecycle.

## Handle errors

The default handler formats Boom errors, returns safe validation details for client errors, hides server-error details, and logs only the internal response status. Supply `errorHandler` when the application needs another response envelope or a redacting structured logger:

```typescript
async function main() {
  const {app} = await bootstrapControllers({
    controllers: [UserController],
    errorHandler: async (error, ctx) => {
      const errorId = crypto.randomUUID();

      // A real reporter must narrow `error` and redact sensitive fields.
      await reportErrorSafely({error, errorId});

      ctx.status = 500;
      ctx.body = {error: 'Internal Server Error', errorId};
    },
  });

  app.listen(3000);
}

void main();
```

The error value is `unknown`; narrow it before accessing error-specific properties. Keep the public response generic and do not place secrets, authorization headers, cookies, request bodies, or raw third-party URLs in logs.

## Production-oriented bootstrap

Defaults make local development convenient. Public applications should choose their security-sensitive behavior explicitly:

```typescript
async function main() {
  const {app} = await bootstrapControllers({
    basePath: '/api',
    bodyParser: {
      formLimit: '56kb',
      jsonLimit: '1mb',
      multipart: false,
      textLimit: '56kb',
    },
    controllers: [HealthController, UserController],
    cors: {
      enabled: true,
      opts: {
        credentials: true,
        origin: 'https://app.example.com',
      },
    },
    openAPI: {enabled: false},
    useHelmet: true,
    validatorOptions: {
      forbidNonWhitelisted: true,
      whitelist: true,
    },
  });

  app.listen(3000);
}

void main();
```

Add authentication, authorization, CSRF protection where applicable, rate limits, request timeouts, trusted-proxy configuration, TLS termination, and upload inspection according to the application's threat model. See the [production security guide](https://amalajs.com/docs/security) for the complete checklist.

## Defaults worth knowing

- Generated routes are attached to the Koa app by default. Set `attachRoutes: false` for manual composition.
- API version `v1` is enabled unless `disableVersioning` is true.
- CORS and OpenAPI/Swagger endpoints are enabled by default.
- Multipart parsing is enabled for backward compatibility.
- Controllers are constructed once per request with the typed Koa context.
- Controller classes and glob paths are trusted startup configuration and must never come from request input.

## Documentation

- [Getting started](https://amalajs.com/docs/getting-started)
- [`bootstrapControllers` reference](https://amalajs.com/docs/api-spec/bootstrap-controllers)
- [Decorator reference](https://amalajs.com/docs/api-spec/decorators)
- [Migrate from v12 to v13](https://amalajs.com/docs/migration-v13)
- [Production security guide](https://amalajs.com/docs/security)
- [Troubleshooting](https://amalajs.com/docs/troubleshooting)

## Development

```bash
npm ci
npm test
npm run build
npm run lint
```

The documentation site requires Node.js 20 or newer:

```bash
cd docs
npm ci
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the pull-request and release workflow. Report suspected vulnerabilities privately by following [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
