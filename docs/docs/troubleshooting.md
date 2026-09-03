---
sidebar_position: 5
sidebar_label: Troubleshooting
---

# Troubleshooting

## A route returns 404

Check the complete generated path:

- `basePath` is prefixed first.
- Versioning adds `/v1` by default.
- `@Controller` and endpoint paths are appended after the version.
- `attachRoutes` defaults to `false`; attach `router.routes()` and `router.allowedMethods()` yourself unless you set it to `true`.

Set `diagnostics: true` temporarily to print registered controller and route paths during startup.

## Decorated controllers are not discovered

Prefer passing controller classes directly:

```typescript
controllers: [UserController, HealthController]
```

When using a glob, make it absolute and match the files produced in the environment. A development glob ending in `.ts` will not find compiled `.js` files in production. Controller modules execute when they are loaded, so globs must come only from trusted configuration.

## Validation does not run

Validated inputs must be classes with class-validator decorators. TypeScript interfaces are erased at runtime.

Confirm these compiler options:

```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

If a bundler strips decorator metadata, compile the decorated code with `tsc` or a toolchain that explicitly preserves the same metadata.

## `Cannot find namespace 'ValidatorJS'`

This usually indicates incompatible or duplicated `class-validator`, `validator`, or `@types/validator` versions. Start from the locked dependency tree, remove stale install artifacts, and reinstall with the repository's package manager. Avoid adding a second copy of class-validator to work around the error.

## The request body is undefined

Amala installs `koa-body` unless `bodyParser` is `false`. Verify that:

- the request uses `POST`, `PUT`, or `PATCH`, or the method appears in `parsedMethods`;
- its `Content-Type` matches JSON, form, text, or multipart input;
- its size is below the configured limit; and
- a custom parser runs before the router when `bodyParser: false` is used.

## File uploads are missing

Multipart parsing must be enabled explicitly if your application disabled it:

```typescript
bodyParser: {
  multipart: true,
  formidable: {
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 2,
  },
}
```

Use `@File()` or `@Req()` to access uploads. koa-body places uploads in `ctx.request.files`. For Multer, use the Koa adapter and disable Amala's parser so only one middleware consumes the stream:

```typescript
import multer from '@koa/multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 5 * 1024 * 1024},
});

await bootstrapControllers({
  bodyParser: false,
  controllers: [UploadController],
});

@Controller('/uploads')
class UploadController {
  @Flow([upload.single('image')])
  @Post('/')
  upload(@File() file: {originalname: string; size: number}) {
    return {name: file.originalname, size: file.size};
  }
}
```

Use `@koa/multer`, not Express's `multer` middleware directly. A single upload is available from `ctx.request.file`; field and array uploads use `ctx.request.files`. Store files explicitly in the handler or a service—parsing an upload does not persist it automatically.

## Swagger cannot load the OpenAPI document

With `basePath: '/api'`, the default routes are `/api/docs` and `/api/swagger`. Omit `publicURL` for same-origin access, or set it to the externally reachable API origin. Do not point a public Swagger page at an internal-only hostname.

Generated OpenAPI server URLs contain `basePath` and the active version. Operation paths are relative to those server URLs, so clients resolve `/users/:id` as `/api/v1/users/:id` without repeating `/api`.

## Multiple Amala apps affect each other

Controller decorator metadata is process-wide. Two apps in one Node.js process can see the same registered controller names and metadata. Run independent or mutually untrusted APIs in separate processes.

## Custom controller construction fails

Use the `controllerFactory` bootstrap option only when the default per-request `new ControllerClass(ctx)` behavior does not fit the application. It runs for every request and receives both the controller class and the typed Koa context. Amala does not provide a container or manage application service lifecycles.

## The documentation site does not build

The current Docusaurus site requires Node.js 20 or newer. From `docs/`, run `npm ci` before `npm run build` so the lockfile and toolchain stay aligned.
