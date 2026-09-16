import "reflect-metadata";
import { ClassMethod, FlowFunction, RestVerb, StringOrRegex } from '../types/metadata';
import { StandardSchemaV1 } from '../types/standardSchema';
export interface ValidationDecoratorOptions {
    validClass?: Function;
    required?: boolean;
    trim?: boolean;
}
export type ValidationDecoratorInput = string | ValidationDecoratorOptions | Record<string, unknown> | StandardSchemaV1;
export type ResolvedValidationDecoratorInput = {
    injectOptions?: string | ValidationDecoratorOptions | Record<string, unknown>;
    standardSchema?: StandardSchemaV1;
};
export declare function isStandardSchema(value: unknown): value is StandardSchemaV1;
export declare function resolveValidationDecoratorInput(input?: ValidationDecoratorInput, propertySchema?: StandardSchemaV1): ResolvedValidationDecoratorInput;
type AddFlowProps = {
    flow: Array<FlowFunction>;
    methodName: string;
    object: Function | ClassMethod;
};
export declare function addFlowFunctionMeta({ flow, methodName, object }: AddFlowProps): void;
type AddVersionProps = {
    version: string | number;
    methodName: string;
    object: Function | ClassMethod;
    endpointDeprecationWarning: string;
};
export declare function addVersionFunctionMeta({ version, methodName, object, endpointDeprecationWarning }: AddVersionProps): void;
type AddVerbProps = {
    verb: RestVerb;
    paths: StringOrRegex[];
    object: ClassMethod;
    methodName: string;
};
export declare function addVerbFunctionMeta({ verb, paths, object, methodName }: AddVerbProps): void;
type AddArgumentProps = {
    index: number;
    ctxKey: string;
    ctxValueOptions?: unknown;
    standardSchema?: StandardSchemaV1;
    methodName: string;
    object: ClassMethod;
};
export declare function addArgumentInjectMeta({ index, ctxKey, ctxValueOptions, standardSchema, methodName, object }: AddArgumentProps): void;
export {};
