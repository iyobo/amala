import {addVerbFunctionMeta} from '../common';
import {ensureArray} from '../../util/tools';
import {ClassMethod, StringOrRegex} from '../../types/metadata';


export function Delete(path: StringOrRegex | StringOrRegex[]) {
  return function (object: ClassMethod, methodName: string): void {
    addVerbFunctionMeta({verb: "delete", methodName, paths: ensureArray(path), object});
  };
}