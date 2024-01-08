import { Class } from "../types/metadata";
export declare function isClass(type: any): boolean;
export declare function isValidatableClass(type: Class): boolean;
export declare function ensureArray<T>(item: T | T[]): T[];
export declare function getPropertiesOfClassValidator(targetConstructor: Function): Record<string, string[]>;
export declare function translateMetaField(metaField: string[]): {
    type: string;
    required?: boolean;
};
