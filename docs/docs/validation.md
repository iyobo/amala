---
sidebar_position: 2
sidebar_label: Validate requests
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Validate requests

Amala accepts any [Standard Schema](https://standardschema.dev/) validator directly in `@Body`, `@Query`, and `@Params`. Use the validation library your application already prefers—there is no Amala adapter or schema registry to configure.

## Start with one order flow

Install a Standard Schema library. This example uses Zod:

```bash
npm install zod
```

The controller keeps request selection, validation, the local name, and its TypeScript type together:

<Tabs groupId="standard-schema-order">
  <TabItem value="controller" label="OrderController.ts" default>

```typescript
import {Body, Controller, Get, Params, Post, Query} from 'amala';
import {z} from 'zod';

const createOrderSchema = z.object({
  sku: z.string().trim().min(1),
  // The controller receives a number even when JSON contains "2".
  quantity: z.coerce.number().int().positive().default(1),
});

const notifySchema = z
  .enum(['true', 'false'])
  .default('false')
  .transform(value => value === 'true');
const orderIdSchema = z.string().uuid();

@Controller('/orders')
export class OrderController {
  @Post('/')
  create(
    @Body(createOrderSchema) order: z.output<typeof createOrderSchema>,
    @Query('notify', notifySchema) notify: boolean,
  ) {
    // Both arguments are already validated and transformed here.
    return {order, notify};
  }

  @Get('/:id')
  getOne(@Params('id', orderIdSchema) id: string) {
    return {id};
  }
}
```

  </TabItem>
  <TabItem value="main" label="main.ts">

```typescript
import {bootstrapControllers} from 'amala';
import {OrderController} from './OrderController';

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [OrderController],
  });

  // Generated routes are attached by default.
  app.listen(3000);
}

void main();
```

  </TabItem>
</Tabs>

`@Body(schema)` validates the complete parsed body. `@Query('notify', schema)` and `@Params('id', schema)` select one value first, then validate that value. Validation still runs when a selected value is missing, allowing the schema to supply a default.

When validation succeeds, Amala injects the schema's output—not the original input. This is why coercion, trimming, defaults, and other transforms are visible in the controller.

## Select one body field

Pass the property name before the schema when a handler needs only one field:

<Tabs groupId="standard-schema-body-field">
  <TabItem value="controller" label="OrderController.ts" default>

```typescript
import {Body, Controller, Patch} from 'amala';
import {z} from 'zod';

const cancelReasonSchema = z.string().trim().min(3).max(500);

@Controller('/orders')
export class OrderController {
  @Patch('/:id/cancel')
  cancel(
    @Body('reason', cancelReasonSchema) reason: string,
  ) {
    // The handler gets the trimmed reason, not the complete request body.
    return {cancelled: true, reason};
  }
}
```

  </TabItem>
  <TabItem value="main" label="main.ts">

```typescript
import {bootstrapControllers} from 'amala';
import {OrderController} from './OrderController';

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [OrderController],
  });

  app.listen(3000);
}

void main();
```

  </TabItem>
</Tabs>

## Bring another library

The same decorator accepts Valibot because both libraries expose the same small runtime contract:

<Tabs groupId="standard-schema-valibot">
  <TabItem value="controller" label="OrderController.ts" default>

```typescript
import {Body, Controller, Post} from 'amala';
import * as v from 'valibot';

const orderSchema = v.object({
  sku: v.pipe(v.string(), v.trim(), v.minLength(1)),
  quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

@Controller('/orders')
export class OrderController {
  @Post('/')
  create(@Body(orderSchema) order: v.InferOutput<typeof orderSchema>) {
    // No Valibot-specific Amala integration is involved.
    return order;
  }
}
```

  </TabItem>
  <TabItem value="main" label="main.ts">

```typescript
import {bootstrapControllers} from 'amala';
import {OrderController} from './OrderController';

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [OrderController],
  });

  app.listen(3000);
}

void main();
```

  </TabItem>
</Tabs>

## Errors and security

Invalid input receives `422 Unprocessable Entity`. `errorDetails` contains normalized field paths and messages, without returning the rejected value, request body, or validator object.

A validator that throws instead of returning Standard Schema issues produces a generic `500` response. Amala does not send the thrown message to the client. Treat schema issue messages as public response text: do not put secrets or internal identifiers in custom validation messages.

Validation establishes the shape of attacker-controlled input. It does not authenticate a caller or authorize an action; keep those checks in application middleware or domain code.

## OpenAPI generation

When the validator exposes the Standard JSON Schema capability, Amala requests its `openapi-3.0` input schema and uses it for generated request bodies and parameters. Zod provides this capability.

Runtime-only validators still work. If a validator cannot produce Standard JSON Schema, Amala omits those schema-derived OpenAPI details instead of inventing a contract. Set `diagnostics: true` during development to receive a safe warning.

## Existing class-validator inputs

Class-based validation remains supported without changes. Keep `@Body()` or `@Body({required: true})` on a class with class-validator decorators. `validatorOptions` continues to apply only to that legacy path.

Use Standard Schema for new inputs when you want portable schemas, inferred input/output types, or transforms. Existing applications can migrate endpoint by endpoint; this feature does not require a flag or a major-version migration.
