import {addArgumentInjectMeta} from '../../common';
import {ClassMethod} from '../../../types/metadata';

export function Req(injectOptions?: string | Record<string, unknown>) {
  return function (
    object: ClassMethod,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "request",
      ctxValueOptions: injectOptions,
      methodName,
      object
    });
  };
}
