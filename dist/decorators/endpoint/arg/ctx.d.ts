import { ValidationDecoratorOptions } from '../../common';
/**
 * Injects the full Koa context.
 * @param injectOptions
 * @constructor
 */
export declare function Ctx(ctxfield?: string, injectOptions?: string | ValidationDecoratorOptions): (object: Record<string, any>, methodName: string, index: number) => void;
