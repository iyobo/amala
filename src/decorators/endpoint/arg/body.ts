import {addArgumentInjectMeta, ValidationDecoratorOptions} from '../../common';
import {ClassMethod} from '../../../types/metadata';

export function Body(injectOptions?: string | ValidationDecoratorOptions) {
  return function (
    object: ClassMethod,
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
