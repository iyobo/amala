import {addVersionFunctionMeta} from '../common';
import {ClassMethod} from '../../types/metadata';

export function Version(version: string, endpointDeprecationWarning?: string) {
  return function (object: ClassMethod, methodName: string): void {
    addVersionFunctionMeta({
      object,
      methodName,
      version,
      endpointDeprecationWarning
    });
  };
}