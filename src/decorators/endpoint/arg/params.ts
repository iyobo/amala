import {addArgumentInjectMeta} from '../../common';

export function Params(injectOptions?: string | Record<string, any>) {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "params",
      injectOptions,
      methodName,
      object
    });
  };
}