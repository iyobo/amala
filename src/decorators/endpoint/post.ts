import {addVerbFunctionMeta} from '../common';
import {ClassMethod, StringOrRegex} from '../../types/metadata';
import {ensureArray} from '../../util/tools';

export function Post(path: StringOrRegex | StringOrRegex[]) {
  return function (object: ClassMethod, methodName: string): void {
    addVerbFunctionMeta({verb: "post", methodName, paths: ensureArray(path), object});
  };
}