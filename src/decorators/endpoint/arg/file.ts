import {addArgumentInjectMeta} from '../../common';

export function File() {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "request",
      injectOptions: "files",
      methodName,
      object
    });
  };
}