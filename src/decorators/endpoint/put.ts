import {addVerbFunctionMeta} from '../common';
import {ClassMethod, StringOrRegex} from '../../types/metadata';
import {ensureArray} from '../../util/tools';

export function Put(path: StringOrRegex | StringOrRegex[]) {
  return function (object: ClassMethod, methodName: string): void {
    addVerbFunctionMeta({verb: "put", methodName, paths: ensureArray(path), object});
  };
}