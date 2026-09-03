import { ValidationDecoratorOptions } from '../../common';
import { ClassMethod } from '../../../types/metadata';
/**
 * Injects the full Koa context.
 * @param injectOptions
 * @constructor
 */
export declare function Ctx(ctxfield?: string, injectOptions?: string | ValidationDecoratorOptions): (object: ClassMethod, methodName: string, index: number) => void;
