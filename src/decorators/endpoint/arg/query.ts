import {addArgumentInjectMeta, ValidationDecoratorOptions} from '../../common';
import {ClassMethod} from '../../../types/metadata';

export function Query(injectOptions?: string | ValidationDecoratorOptions) {
  return function (
    object: ClassMethod,
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
