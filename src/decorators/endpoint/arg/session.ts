import {addArgumentInjectMeta} from '../../common';

export function Session(injectOptions?: string | Record<string, any>) {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "session",
      injectOptions,
      methodName,
      object
    });
  };
}