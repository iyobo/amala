import { ClassMethod, StringOrRegex } from '../../types/metadata';
export declare function Patch(path: StringOrRegex | StringOrRegex[]): (object: ClassMethod, methodName: string) => void;
