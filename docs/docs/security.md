---
sidebar_position: 3
sidebar_label: Security
---

# Production security guide

Amala supplies routing and request-handling primitives. A secure deployment still depends on application middleware, validation policy, infrastructure, and operational controls.

## Start with explicit production options

```typescript
const {app} = await bootstrapControllers({
  attachRoutes: true,
  basePath: '/api',
  controllers: [HealthController, UserController],
  cors: {
    enabled: true,
    opts: {
      credentials: true,
      origin: 'https://app.example.com',
    },
  },
  bodyParser: {
    formLimit: '56kb',
    jsonLimit: '1mb',
    multipart: false,
    textLimit: '56kb',
  },
  openAPI: {enabled: false},
  useHelmet: true,
  validatorOptions: {
    forbidNonWhitelisted: true,
    whitelist: true,
  },
});
```

Adapt the limits and policy to the API; the important part is making them deliberate.

## Authentication and authorization

Amala does not authenticate requests. Use Koa middleware to verify a session, token, or other credential, then authorize the requested action before the handler runs.

`@CurrentUser()` only reads `ctx.state.user`. Never treat the presence or shape of a client-supplied value as proof of identity. Protect privileged, destructive, export, and payment operations with appropriately strong or step-up authentication.

## CORS and browser credentials

CORS is enabled by default. Configure an explicit origin allowlist for browser clients, or disable Amala's middleware and install your own policy. A permissive CORS header is not authentication.

For cookie-authenticated APIs, also design CSRF protection, secure cookie attributes, origin checks, and trusted-proxy handling. Never use a wildcard origin with credentials.

## Body and upload limits

Multipart parsing is enabled by default for backward compatibility. Set `multipart: false` unless the application accepts uploads.

When uploads are required:

- set `maxFileSize`, `maxFiles`, and field limits;
- generate server-side filenames and store files outside a public web root;
- inspect file content instead of trusting extensions or `Content-Type`;
- scan or sandbox untrusted media and documents before processing; and
- ensure processing workers do not inherit unrelated application secrets.

Set bounded JSON, text, and form limits even when no files are accepted.

## Input validation

Use decorated classes for boundary inputs. `whitelist: true` removes unknown properties, while `forbidNonWhitelisted: true` rejects them. Validation is not authorization: a valid identifier or role name still needs a server-side access check.

Validate data again at narrower trust boundaries where required, such as database constraints, outbound requests, filesystem paths, and subprocess arguments.

## OpenAPI and diagnostics

OpenAPI JSON and Swagger UI are enabled by default. They expose route names and request shapes, so disable them in production or protect them when that inventory is sensitive.

Keep `diagnostics` off in normal production operation. Custom error handlers and logs must redact authorization headers, cookies, secrets, request bodies, and query strings or fragments from third-party URLs.

## Trusted startup configuration

Controller classes and glob paths execute code at startup. Keep them in version-controlled, trusted configuration. Never construct a controller glob from request input.

Amala's controller metadata is process-wide. Do not host mutually untrusted applications or tenants in the same process; isolate them at the process or container boundary.

## Network and proxy controls

Terminate TLS with a maintained proxy or load balancer and configure Koa's proxy trust only for infrastructure you control. Apply request timeouts, connection limits, and rate limits at the edge and, where needed, per authenticated identity.

## Dependencies and disclosure

Install from the lockfile in CI, keep Amala and its transitive dependencies current, and review advisories before deployment. The documentation build is a separate toolchain; do not ship it inside the API runtime image.

For suspected vulnerabilities in Amala, follow the private reporting process in the repository's [security policy](https://github.com/iyobo/amala/security/policy).
