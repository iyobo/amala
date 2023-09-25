import {addArgumentInjectMeta} from '../../common';

export function CurrentUser(injectOptions?: string | Record<string, any>) {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "currentUser",
      injectOptions,
      methodName,
      object
    });
  };
}