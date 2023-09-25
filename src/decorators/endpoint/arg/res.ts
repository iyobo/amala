import {addArgumentInjectMeta} from '../../common';

export function Res(injectOptions?: string | Record<string, any>) {
  return function (
    object: Record<string, any>,
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