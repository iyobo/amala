import {addArgumentInjectMeta, ValidationDecoratorOptions} from '../../common';

export function Query(injectOptions?: string | ValidationDecoratorOptions) {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "query",
      ctxValueOptions: injectOptions,
      methodName,
      object
    });
  };
}