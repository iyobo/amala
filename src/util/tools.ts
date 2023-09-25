import {Class} from '../types/metadata';

export function isClass(type) {
  return type?.prototype?.constructor && type?.prototype?.constructor?.name !== 'Object';
}

export function isValidatableClass(type: Class) {

  return type?.prototype?.constructor
    && type?.prototype?.constructor?.name !== 'Object'
    && type?.prototype?.constructor?.name !== 'Number'
    && type?.prototype?.constructor?.name !== 'String'
    && type?.prototype?.constructor?.name !== 'Boolean'

}

export function ensureArray<T>(item: T | T[]): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}