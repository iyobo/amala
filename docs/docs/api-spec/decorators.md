---
sidebar_position: 2
sidebar_label: Decorators
---

# Decorator reference

Amala decorators register controllers and map Koa request data to endpoint arguments.

## Controller decorators

### `@Controller(path?)`

Registers a class as a controller. The path, or each path in an array, is prefixed to every endpoint in the class.

```typescript
import {bootstrapControllers, Controller, Get} from 'amala';

@Controller(['/users', '/people'])
class UserController {
  @Get('/')
  list() {
    return [];
  }
}

async function main() {
  const {app} = await bootstrapControllers({controllers: [UserController]});
  app.listen(3000);
}

void main();
```

### `@Flow(middleware)`

Adds one Koa middleware function or an array of middleware functions to every endpoint in the controller. Middleware runs in declaration order before the endpoint handler.

Use `AmalaMiddleware<AppState, ContextExtensions>` when the flow reads application-specific Koa values. `@Flow` preserves those generics instead of widening the context to `any`.

```typescript
import {AmalaMiddleware, bootstrapControllers, Controller, Flow, Get} from 'amala';

interface AppState {
  user?: {isAdmin: boolean};
}

const requireUser: AmalaMiddleware<AppState> = async (ctx, next) => {
  if (!ctx.state.user) ctx.throw(401);
  await next();
};

const requireAdmin: AmalaMiddleware<AppState> = async (ctx, next) => {
  if (!ctx.state.user?.isAdmin) ctx.throw(403);
  await next();
};

@Controller('/admin')
@Flow([requireUser, requireAdmin])
class AdminController {
  @Get('/')
  dashboard() {
    return {access: 'granted'};
  }
}

async function main() {
  const {app} = await bootstrapControllers<AppState>({
    controllers: [AdminController],
  });
  app.listen(3000);
}

void main();
```

## Endpoint decorators

`@Get`, `@Post`, `@Patch`, `@Put`, and `@Delete` register a method for one path or an array of paths.

```typescript
import {bootstrapControllers, Controller, Get} from 'amala';

@Controller('/users')
class UserController {
  @Get(['/me', '/profile'])
  getProfile() {
    return {name: 'Ada'};
  }
}

async function main() {
  const {app} = await bootstrapControllers({controllers: [UserController]});
  app.listen(3000);
}

void main();
```

### `@Version(version, deprecationMessage?)`

Limits a handler to a configured API version. An optional message is added to the `Deprecation` response header.

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
    versions: [1, 2],
  });
  app.listen(3000);
}

void main();
```

Place a handler without `@Version` after version-specific handlers for the same method and path; it handles the remaining configured versions.

### Endpoint `@Flow`

Adds middleware to one endpoint. Controller middleware runs first, followed by endpoint middleware.

```typescript
import {bootstrapControllers, Controller, Delete, Flow, Params} from 'amala';

@Controller('/users')
class UserController {
  @Delete('/:id')
  @Flow([requireUser, requireOwner])
  remove(@Params('id') id: string) {
    return {removed: id};
  }
}

async function main() {
  const {app} = await bootstrapControllers({controllers: [UserController]});
  app.listen(3000);
}

void main();
```

## Argument decorators

| Decorator | Injected value |
| --- | --- |
| `@Body()` | `ctx.request.body` |
| `@Body('field')` | `ctx.request.body.field` |
| `@Body(schema)` / `@Body('field', schema)` | Standard Schema output for the body or one field |
| `@Body({required: true})` | The body, with a `422` response when empty |
| `@Params()` / `@Params('id')` | All path parameters or one parameter |
| `@Params(schema)` / `@Params('id', schema)` | Standard Schema output for all parameters or one parameter |
| `@Query()` / `@Query('q')` | The parsed query or one query value |
| `@Query(schema)` / `@Query('q', schema)` | Standard Schema output for the query or one value |
| `@Header()` / `@Header('name')` | All request headers or one header |
| `@State()` / `@State('name')` | Koa state or one state value |
| `@CurrentUser()` | `ctx.state.user` |
| `@Session()` / `@Session('name')` | The configured Koa session or one value |
| `@File()` | `ctx.request.file` for a single @koa/multer upload, otherwise `ctx.request.files` |
| `@Req()` | The Koa request |
| `@Res()` | The Koa response |
| `@Ctx()` / `@Ctx('name')` | The Koa context or one context field |

Prefer the narrowest decorator that gives the handler what it needs. This reduces coupling to Koa and makes the method easier to test.

### Standard Schema validation

Pass any Standard Schema validator directly. Amala validates after selecting the decorated value and injects parsed output, including transforms and defaults:

```typescript
import {Body, bootstrapControllers, Controller, Post} from 'amala';
import {z} from 'zod';

const orderSchema = z.object({
  sku: z.string().trim().min(1),
  // The handler receives a number, even when JSON contains "2".
  quantity: z.coerce.number().int().positive().default(1),
});

@Controller('/orders')
class OrderController {
  @Post('/')
  create(@Body(orderSchema) order: z.output<typeof orderSchema>) {
    return order;
  }
}

async function main() {
  const {app} = await bootstrapControllers({controllers: [OrderController]});
  app.listen(3000);
}

void main();
```

The same overloads accept Zod, Valibot, or another compatible library without an Amala adapter. See [Validate requests](../validation.md) for selected fields, query and path values, error behavior, and OpenAPI generation.

### Class validation and conversion

When a body, path, or query argument has a class type, Amala uses reflected metadata to transform the value and run class-validator:

```typescript
import {
  bootstrapControllers,
  Controller,
  Get,
  IsString,
  Params,
} from 'amala';

class LookupInput {
  @IsString()
  id!: string;
}

@Controller('/items')
class ItemController {
  @Get('/:id')
  getOne(@Params() input: LookupInput) {
    return input;
  }
}

async function main() {
  const {app} = await bootstrapControllers({controllers: [ItemController]});
  app.listen(3000);
}

void main();
```

Use classes, not interfaces, for validated inputs. Consider `whitelist: true` and `forbidNonWhitelisted: true` in `validatorOptions` when extra properties should be rejected.

For nested objects, combine class-validator's `@ValidateNested()` with class-transformer's `@Type()` so the child object has a runtime class. Nested failures use dot-separated field names such as `metadata.size` in `errorDetails`; raw target objects and values are not returned.

### Authentication

`@CurrentUser()` is an accessor, not an authentication check. Authentication middleware must verify the request, store the trusted user in `ctx.state.user`, and run before the endpoint:

```typescript
import {
  AmalaMiddleware,
  bootstrapControllers,
  Controller,
  CurrentUser,
  Flow,
  Get,
} from 'amala';

interface AuthenticatedUser {
  id: string;
}

interface AppState {
  user?: AuthenticatedUser;
}

const requireUser: AmalaMiddleware<AppState> = async (ctx, next) => {
  // Verify the credential before assigning this trusted identity.
  ctx.state.user = await authenticate(ctx);
  await next();
};

@Controller('/account')
class AccountController {
  @Get('/me')
  @Flow(requireUser)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}

async function main() {
  const {app} = await bootstrapControllers<AppState>({
    controllers: [AccountController],
  });
  app.listen(3000);
}

void main();
```

### File uploads

`@File()` supports koa-body's `ctx.request.files` and @koa/multer's `ctx.request.file`/`files` shapes. Set explicit upload limits and verify file type from content, not only from the supplied filename or content type. Disable multipart parsing when the application does not accept files.

## Custom argument decorators

Wrap `@Ctx` to name application-specific context values:

```typescript
import {
  AmalaMiddleware,
  bootstrapControllers,
  Controller,
  Ctx,
  Get,
} from 'amala';

interface ContextExtensions {
  requestId: string;
}

export const RequestId = () => Ctx('requestId');

const requestContext: AmalaMiddleware<{}, ContextExtensions> =
  async (ctx, next) => {
    ctx.requestId = crypto.randomUUID();
    await next();
  };

@Controller('/items')
class ItemController {
  @Get('/')
  list(@RequestId() requestId: string) {
    return {requestId};
  }
}

async function main() {
  const {app} = await bootstrapControllers<{}, ContextExtensions>({
    controllers: [ItemController],
    flow: [requestContext],
  });
  app.listen(3000);
}

void main();
```

The handler annotation describes the injected value. Use `AmalaContext<AppState, ContextExtensions>` when injecting the complete context with `@Ctx()`.

## Controller metadata

`getControllers()` returns Amala's process-wide controller metadata, indexed by controller class name. It is useful for diagnostics and tooling; it does not return live controller instances.

```typescript
import {bootstrapControllers, Controller, getControllers} from 'amala';

@Controller('/users')
class UserController {}

async function main() {
  await bootstrapControllers({controllers: [UserController]});

  const controllers = getControllers();
  console.log(Object.keys(controllers));
}

void main();
```

Because the registry is process-wide, use separate processes for mutually untrusted applications or modules.
