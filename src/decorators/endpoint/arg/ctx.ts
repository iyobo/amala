import {addArgumentInjectMeta, ValidationDecoratorOptions} from '../../common';

/**
 * Injects the full Koa context.
 * @param injectOptions
 * @constructor
 */
export function Ctx(ctxfield?: string, injectOptions?: string | ValidationDecoratorOptions) {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: ctxfield || "ctx",
      ctxValueOptions: injectOptions,
      methodName,
      object
    });
  };
}