---
sidebar_label: Migrate to v11
title: Migrate from Amala v10 to v11
---

# Migrate from Amala v10 to v11

Amala 11 moves the framework to the maintained Koa runtime stack and upgrades its re-exported `class-validator` API. It is a major release because the minimum Node.js version and several upstream APIs change.

## Update the package

```bash
npm install amala@^11.0.0
```

Use Node.js 22 or newer, then run your TypeScript build and the request, validation, upload, redirect, and error-handling tests for your application.

## Upgrade the Koa runtime

Amala 11 uses Koa 3.2, `@koa/router` 15.7, and `koa-body` 8.0.

- Replace generator middleware with `async` middleware before upgrading.
- If application code calls `ctx.throw`, pass arguments as `ctx.throw(status, error, properties)`. Koa 3 no longer accepts a message string as the second argument.
- Replace `ctx.redirect('back')` with `ctx.back()`.
- Recheck code that depends on Koa query parsing. Koa 3 uses `URLSearchParams` semantics.
- Remove `@types/koa__router`; Router 15 publishes its own TypeScript declarations.
- Replace custom regular-expression route parameters such as `/:id(\\d+)`. Router 15 uses `path-to-regexp` 8, which no longer accepts that syntax. Use `/:id` and validate the injected parameter instead.

`koa-body` has also changed since the version used by Amala 10. Raw request data is exposed as `request.rawBody`; unparsed methods are no longer patched with an empty body; uploaded file contents are not copied into `request.body`; and multipart files use current Formidable types. Read uploads from `@File()` or `request.files`. Amala keeps the old `name` and `type` file aliases alongside Formidable's `originalFilename` and `mimetype` fields. Amala still enables multipart parsing by default for compatibility, so keep explicit upload limits and content validation in production.

See the upstream [Koa 3 migration guide](https://github.com/koajs/koa/blob/master/docs/migration-v2-to-v3.md), [Router 15 migration guide](https://github.com/koajs/router/blob/master/FULL_MIGRATION_TO_V15%2B.md), and [koa-body releases](https://github.com/koajs/koa-body/releases) for their complete change lists.

## Update `@IsIBAN()` validation options

In v10, the first argument was a `ValidationOptions` object:

```typescript
class PaymentInput {
  @IsIBAN({message: 'Enter a valid IBAN'})
  iban: string;
}
```

In v11, the first argument configures IBAN locale filtering. Move class-validator's validation options to the second argument:

```typescript
class PaymentInput {
  @IsIBAN(undefined, {message: 'Enter a valid IBAN'})
  iban: string;
}
```

You can now allow or reject specific IBAN locales through the first argument:

```typescript
class PaymentInput {
  @IsIBAN(
    {whitelist: ['GB', 'IE']},
    {message: 'Enter a supported UK or Irish IBAN'},
  )
  iban: string;
}
```

This change applies to `IsIBAN` imported from either `amala` or `class-validator`.

## Other class-validator 0.15 additions

The dependency release also adds validator-level `validateIf`, ISO 3166-1 numeric country-code validation, ISO 639-1 language-code validation, and additional UUID versions. See the [upstream class-validator changelog](https://github.com/typestack/class-validator/blob/develop/CHANGELOG.md#0151-2026-02-26) for the complete list.
