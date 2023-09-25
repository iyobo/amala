import {addArgumentInjectMeta} from '../../common';

export function State(injectOptions?: string | Record<string, any>) {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "state",
      ctxValueOptions: injectOptions,
      methodName,
      object
    });
  };
}