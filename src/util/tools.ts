import { Class } from "../types/metadata";
import { getMetadataStorage } from "class-validator";

export function isClass(type) {
  return type?.prototype?.constructor && type?.prototype?.constructor?.name !== "Object";
}

export function isValidatableClass(type: Class) {

  return type?.prototype?.constructor
    && type?.prototype?.constructor?.name !== "Object"
    && type?.prototype?.constructor?.name !== "Number"
    && type?.prototype?.constructor?.name !== "String"
    && type?.prototype?.constructor?.name !== "Boolean";

}

export function ensureArray<T>(item: T | T[]): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

export function getPropertiesOfClassValidator(targetConstructor: Function): Record<string, string[]> {
  const metadataStorage = getMetadataStorage();
  const targetMetadatas = metadataStorage
    .getTargetValidationMetadatas(targetConstructor, undefined, false, false, undefined);
  const groupedMetadatas = metadataStorage.groupByPropertyName(targetMetadatas);
  return Object.fromEntries(Object.entries(groupedMetadatas).map(([property, decorators]) => {
    const CM = decorators.map(decorator => metadataStorage.getTargetValidatorConstraints(decorator.constraintCls).map(v => v.name));
    return [property, CM.flat()];
  }));
}

const cvCodex = {
  "isString": "string",
  "isNumber": "number",
  "isBoolean": "boolean"
};

export function translateMetaField(metaField: string[]): { type: string, required?: boolean } {
  const result = {
    type: "string",
    required: false
  };
  metaField.forEach(it => {
    result.type = cvCodex[it] || result.type;
    result.required = result.required || it.includes('Required');
  });

  return result;
}