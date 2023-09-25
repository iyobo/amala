import {addArgumentInjectMeta} from '../../common';

export function Header(injectOptions?: string | Record<string, any>) {
  return function (
    object: Record<string, any>,
    methodName: string,
    index: number
  ) {
    addArgumentInjectMeta({
      index,
      injectSource: "header",
      injectOptions,
      methodName,
      object
    });
  };
}