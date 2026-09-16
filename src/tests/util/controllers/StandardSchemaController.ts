import * as v from 'valibot';
import {z} from 'zod';
import {
  Body,
  Controller,
  Get,
  Params,
  Post,
  Query,
  StandardSchemaV1
} from '../../../index';

const orderSchema = z.object({
  sku: z.string().trim().min(1),
  // Coercion and defaults happen before the controller sees the order.
  quantity: z.coerce.number().int().positive().default(1)
});

const valibotOrderSchema = v.object({
  sku: v.pipe(v.string(), v.trim(), v.minLength(1))
});

const asyncReferenceSchema: StandardSchemaV1<string, string> = {
  '~standard': {
    version: 1,
    vendor: 'amala-test',
    async validate(value) {
      await Promise.resolve();
      return typeof value === 'string'
        ? {value: value.toUpperCase()}
        : {issues: [{message: 'Reference must be a string'}]};
    }
  }
};

const throwingSchema: StandardSchemaV1 = {
  '~standard': {
    version: 1,
    vendor: 'amala-test',
    validate() {
      throw new Error('private validator details');
    }
  }
};

const manyIssuesSchema: StandardSchemaV1 = {
  '~standard': {
    version: 1,
    vendor: 'amala-test',
    validate: () => ({
      issues: Array.from({length: 101}, (_, index) => ({
        message: 'Invalid field',
        path: [{key: 'nested'}, index]
      }))
    })
  }
};

@Controller('/standard-schema')
export class StandardSchemaController {
  @Post('/orders')
  async createOrder(@Body(orderSchema) order: z.output<typeof orderSchema>) {
    // This is already trimmed, coerced, defaulted, and type-safe.
    return order;
  }

  @Post('/orders/sku')
  async normalizeSku(
    @Body('sku', z.string().trim().toUpperCase()) sku: string
  ) {
    return {sku};
  }

  @Post('/valibot')
  async createValibotOrder(
    @Body(valibotOrderSchema) order: v.InferOutput<typeof valibotOrderSchema>
  ) {
    // Amala uses the shared contract; there is no Valibot-specific adapter.
    return order;
  }

  @Get('/pages')
  async list(@Query('page', z.coerce.number().int().positive().default(1)) page: number) {
    return {page, type: typeof page};
  }

  @Get('/orders/:id')
  async getOrder(@Params('id', z.coerce.number().int().positive()) id: number) {
    return {id, type: typeof id};
  }

  @Get('/references')
  async resolveReference(@Query('ref', asyncReferenceSchema) reference: string) {
    return {reference};
  }

  @Post('/validator-error')
  async validatorError(@Body(throwingSchema) body: unknown) {
    return body;
  }

  @Post('/many-issues')
  async manyIssues(@Body(manyIssuesSchema) body: unknown) {
    return body;
  }
}
