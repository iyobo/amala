import "reflect-metadata";
import { ClassMethod, FlowFunction, RestVerb, StringOrRegex } from '../types/metadata';
export interface ValidationDecoratorOptions {
    validClass?: Function;
    required?: boolean;
    trim?: boolean;
}
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
    methodName: string;
    object: ClassMethod;
};
export declare function addArgumentInjectMeta({ index, ctxKey, ctxValueOptions, methodName, object }: AddArgumentProps): void;
export {};
