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
@Controller(['/users', '/people'])
class UserController {}
```

### `@Flow(middleware)`

Adds one Koa middleware function or an array of middleware functions to every endpoint in the controller. Middleware runs in declaration order before the endpoint handler.

```typescript
@Controller('/admin')
@Flow([requireUser, requireAdmin])
class AdminController {}
```

## Endpoint decorators

`@Get`, `@Post`, `@Patch`, `@Put`, and `@Delete` register a method for one path or an array of paths.

```typescript
@Get(['/me', '/profile'])
getProfile() {
  return {name: 'Ada'};
}
```

### `@Version(version, deprecationMessage?)`

Limits a handler to a configured API version. An optional message is added to the `Deprecation` response header.

```typescript
@Get('/')
@Version(1, 'Use version 2.')
listV1() {}
```

Place a handler without `@Version` after version-specific handlers for the same method and path; it handles the remaining configured versions.

### Endpoint `@Flow`

Adds middleware to one endpoint. Controller middleware runs first, followed by endpoint middleware.

```typescript
@Delete('/:id')
@Flow([requireUser, requireOwner])
remove(@Params('id') id: string) {}
```

## Argument decorators

| Decorator | Injected value |
| --- | --- |
| `@Body()` | `ctx.request.body` |
| `@Body('field')` | `ctx.request.body.field` |
| `@Body({required: true})` | The body, with a `422` response when empty |
| `@Params()` / `@Params('id')` | All path parameters or one parameter |
| `@Query()` / `@Query('q')` | The parsed query or one query value |
| `@Header()` / `@Header('name')` | All request headers or one header |
| `@State()` / `@State('name')` | Koa state or one state value |
| `@CurrentUser()` | `ctx.state.user` |
| `@Session()` / `@Session('name')` | The configured Koa session or one value |
| `@File()` | `ctx.request.file` for a single @koa/multer upload, otherwise `ctx.request.files` |
| `@Req()` | The Koa request |
| `@Res()` | The Koa response |
| `@Ctx()` / `@Ctx('name')` | The Koa context or one context field |

Prefer the narrowest decorator that gives the handler what it needs. This reduces coupling to Koa and makes the method easier to test.

### Validation and conversion

When a body, path, or query argument has a class type, Amala uses reflected metadata to transform the value and run class-validator:

```typescript
class LookupInput {
  @IsString()
  id: string;
}

@Get('/:id')
getOne(@Params() input: LookupInput) {
  return input;
}
```

Use classes, not interfaces, for validated inputs. Consider `whitelist: true` and `forbidNonWhitelisted: true` in `validatorOptions` when extra properties should be rejected.

For nested objects, combine class-validator's `@ValidateNested()` with class-transformer's `@Type()` so the child object has a runtime class. Nested failures use dot-separated field names such as `metadata.size` in `errorDetails`; raw target objects and values are not returned.

### Authentication

`@CurrentUser()` is an accessor, not an authentication check. Authentication middleware must verify the request, store the trusted user in `ctx.state.user`, and run before the endpoint:

```typescript
@Get('/me')
@Flow(requireUser)
getMe(@CurrentUser() user: AuthenticatedUser) {
  return user;
}
```

### File uploads

`@File()` supports koa-body's `ctx.request.files` and @koa/multer's `ctx.request.file`/`files` shapes. Set explicit upload limits and verify file type from content, not only from the supplied filename or content type. Disable multipart parsing when the application does not accept files.

## Custom argument decorators

Wrap `@Ctx` to name application-specific context values:

```typescript
export const RequestId = () => Ctx('requestId');

@Get('/')
list(@RequestId() requestId: string) {
  return {requestId};
}
```

## Controller metadata

`getControllers()` returns Amala's process-wide controller metadata, indexed by controller class name. It is useful for diagnostics and tooling; it does not return live controller instances.

```typescript
import {getControllers} from 'amala';

const controllers = getControllers();
console.log(Object.keys(controllers));
```

Because the registry is process-wide, use separate processes for mutually untrusted applications or modules.
