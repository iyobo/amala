import {addArgumentInjectMeta} from '../../common';
import {ClassMethod} from '../../../types/metadata';

export function CurrentUser(injectOptions?: string | Record<string, unknown>) {
  return function (
    object: ClassMethod,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "currentUser",
      ctxValueOptions: injectOptions,
      methodName,
      object
    });
  };
}
