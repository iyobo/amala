import "reflect-metadata";
import {metadata} from '../index';
import {AmalaMetadataController, AmalaMetadataEndpoint, Class, ClassMethod, FlowFunction, RestVerb, StringOrRegex} from '../types/metadata';
import {StandardSchemaV1} from '../types/standardSchema';

export interface ValidationDecoratorOptions {
  validClass?: Function;
  required?: boolean;
  trim?: boolean;
}

export type ValidationDecoratorInput =
  | string
  | ValidationDecoratorOptions
  | Record<string, unknown>
  | StandardSchemaV1;

export type ResolvedValidationDecoratorInput = {
  injectOptions?: string | ValidationDecoratorOptions | Record<string, unknown>;
  standardSchema?: StandardSchemaV1;
};

export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  if (
    (typeof value !== 'object' && typeof value !== 'function')
    || value === null
  ) {
    return false;
  }

  const standard = (value as Record<string, unknown>)["~standard"];
  if (!standard || typeof standard !== 'object') return false;

  const props = standard as Record<string, unknown>;
  return props.version === 1 && typeof props.validate === 'function';
}

export function resolveValidationDecoratorInput(
  input?: ValidationDecoratorInput,
  propertySchema?: StandardSchemaV1
): ResolvedValidationDecoratorInput {
  if (propertySchema) {
    if (typeof input !== 'string') {
      throw new TypeError(
        'A property name is required when a second Standard Schema argument is supplied'
      );
    }
    return {injectOptions: input, standardSchema: propertySchema};
  }

  if (isStandardSchema(input)) return {standardSchema: input};
  return {injectOptions: input};
}

type AddFlowProps = {
  flow: Array<FlowFunction>,
  methodName: string,
  object: Function | ClassMethod
}

export function addFlowFunctionMeta({flow, methodName, object}: AddFlowProps): void {

  const controller = metadata.controllers[object.constructor.name] || {};
  controller.endpoints = controller.endpoints || {};
  controller.endpoints[methodName] = controller.endpoints[methodName] || {};

  controller.endpoints[methodName].flow = controller.endpoints[methodName].flow || [];
  controller.endpoints[methodName].flow = [...controller.endpoints[methodName].flow, ...flow];

  metadata.controllers[object.constructor.name] = controller;
}

type AddVersionProps = {
  version: string | number,
  methodName: string,
  object: Function | ClassMethod,
  endpointDeprecationWarning: string
}

export function addVersionFunctionMeta({
                                         version,
                                         methodName,
                                         object,
                                         endpointDeprecationWarning
                                       }: AddVersionProps): void {

  const controller = metadata.controllers[object.constructor.name] || {};
  controller.endpoints = controller.endpoints || {};
  controller.endpoints[methodName] = controller.endpoints[methodName] || {};

  // The presence of versions signifies that this method might be unavailable for some versions and should
  // be skipped in final metadata processing step
  controller.endpoints[methodName].limitToVersions =
    controller.endpoints[methodName].limitToVersions || {};
  controller.endpoints[methodName].limitToVersions[version] =
    endpointDeprecationWarning || true;

  metadata.controllers[object.constructor.name] = controller;
} // Function decorators

type AddVerbProps = {
  verb: RestVerb,
  paths: StringOrRegex[],
  object: ClassMethod,
  methodName: string
}

export function addVerbFunctionMeta({verb, paths, object, methodName}: AddVerbProps): void {

  const controller = metadata.controllers[object.constructor.name] || {};
  controller.endpoints = controller.endpoints || {};
  controller.endpoints[methodName] = controller.endpoints[methodName] || {};

  const argumentTypes: Class[] | undefined = Reflect.getMetadata(
    "design:paramtypes",
    object,
    methodName
  );
  controller.endpoints[methodName].arguments = controller.endpoints[methodName].arguments || {} // this shouldn't exist but whatever
  argumentTypes?.forEach((argType, idx)=>{
    controller.endpoints[methodName].arguments[idx] = controller.endpoints[methodName].arguments[idx] || {}
    controller.endpoints[methodName].arguments[idx].argType = argType
  })


  controller.endpoints[methodName].verb = verb;
  controller.endpoints[methodName].paths = paths;
  const targetMethod = (object as Record<string, unknown>)[methodName];
  if (typeof targetMethod !== 'function') {
    throw new TypeError(`${methodName} must be a controller method`);
  }
  controller.endpoints[methodName].targetMethod = targetMethod as (...args: unknown[]) => unknown;

  metadata.controllers[object.constructor.name] = controller;
} // argument injection decorators


type AddArgumentProps = {
  index: number
  ctxKey: string
  ctxValueOptions?: unknown
  standardSchema?: StandardSchemaV1
  methodName: string
  object: ClassMethod
}

export function addArgumentInjectMeta({
                                        index,
                                        ctxKey,
                                        ctxValueOptions,
                                        standardSchema,
                                        methodName,
                                        object
                                      }: AddArgumentProps): void {
  // console.log('argument', stackConfig, injectSource, injectOptions, object, methodName);
  const controller: AmalaMetadataController = metadata.controllers[object.constructor.name] || {};

  controller.endpoints = controller.endpoints || {};
  controller.endpoints[methodName] = controller.endpoints[methodName] || <AmalaMetadataEndpoint>{};

  controller.endpoints[methodName].arguments =
    controller.endpoints[methodName].arguments || {};
  controller.endpoints[methodName].arguments[index] = {
    ctxKey,
    ctxValueOptions,
    standardSchema
  };

  metadata.controllers[object.constructor.name] = controller;
}
