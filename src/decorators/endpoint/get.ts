import {addVerbFunctionMeta} from '../common';
import {ClassMethod, StringOrRegex} from '../../types/metadata';
import {ensureArray} from '../../util/tools';

export function Get(path: StringOrRegex | StringOrRegex[]) {
  return function (object: ClassMethod, methodName: string): void {
    addVerbFunctionMeta({verb: "get", methodName, paths: ensureArray(path), object});
  };
}