import {addArgumentInjectMeta} from '../../common';
import {ClassMethod} from '../../../types/metadata';

export function Session(injectOptions?: string | Record<string, unknown>) {
  return function (
    object: ClassMethod,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "session",
      ctxValueOptions: injectOptions,
      methodName,
      object
    });
  };
}
