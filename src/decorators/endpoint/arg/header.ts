import {addArgumentInjectMeta} from '../../common';
import {ClassMethod} from '../../../types/metadata';

export function Header(injectOptions?: string | Record<string, unknown>) {
  return function (
    object: ClassMethod,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "header",
      ctxValueOptions: injectOptions,
      methodName,
      object
    });
  };
}
