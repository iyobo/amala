import * as v from 'valibot';
import { z } from 'zod';
declare const orderSchema: z.ZodObject<{
    sku: z.ZodString;
    quantity: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
declare const valibotOrderSchema: v.ObjectSchema<{
    readonly sku: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.TrimAction, v.MinLengthAction<string, 1, undefined>]>;
}, undefined>;
export declare class StandardSchemaController {
    createOrder(order: z.output<typeof orderSchema>): Promise<{
        sku: string;
        quantity: number;
    }>;
    normalizeSku(sku: string): Promise<{
        sku: string;
    }>;
    createValibotOrder(order: v.InferOutput<typeof valibotOrderSchema>): Promise<{
        sku: string;
    }>;
    list(page: number): Promise<{
        page: number;
        type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    }>;
    getOrder(id: number): Promise<{
        id: number;
        type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    }>;
    resolveReference(reference: string): Promise<{
        reference: string;
    }>;
    validatorError(body: unknown): Promise<unknown>;
    manyIssues(body: unknown): Promise<unknown>;
}
export {};
