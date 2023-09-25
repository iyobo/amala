import {addArgumentInjectMeta} from '../../common';

export function Req(injectOptions?: string | Record<string, any>) {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "request",
      injectOptions,
      methodName,
      object
    });
  };
}