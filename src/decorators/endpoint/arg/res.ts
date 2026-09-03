import {addArgumentInjectMeta} from '../../common';
import {ClassMethod} from '../../../types/metadata';

export function Res(injectOptions?: string | Record<string, unknown>) {
  return function (
    object: ClassMethod,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "res",
      ctxValueOptions: injectOptions,
      methodName,
      object
    });
  };
}
