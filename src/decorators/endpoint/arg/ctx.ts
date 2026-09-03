import {addArgumentInjectMeta, ValidationDecoratorOptions} from '../../common';
import {ClassMethod} from '../../../types/metadata';

/**
 * Injects the full Koa context.
 * @param injectOptions
 * @constructor
 */
export function Ctx(ctxfield?: string, injectOptions?: string | ValidationDecoratorOptions) {
  return function (
    object: ClassMethod,
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
