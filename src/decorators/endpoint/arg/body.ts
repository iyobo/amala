import {addArgumentInjectMeta, ValidationDecoratorOptions} from '../../common';

export function Body(injectOptions?: string | ValidationDecoratorOptions) {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "body",
      ctxValueOptions: injectOptions,
      methodName,
      object
    });
  };
}