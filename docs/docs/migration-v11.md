---
sidebar_label: Migrate to v11
title: Migrate from Amala v10 to v11
---

# Migrate from Amala v10 to v11

Amala 11 upgrades its re-exported `class-validator` API from 0.14 to 0.15.1. The upstream release changes the `@IsIBAN()` decorator signature, so Amala uses a major version even though the framework's routing API is unchanged.

## Update the package

```bash
npm install amala@^11.0.0
```

Run your TypeScript build and validation tests after upgrading. Applications that do not call `@IsIBAN()` should not need source changes.

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
