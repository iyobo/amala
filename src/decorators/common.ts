import "reflect-metadata";
import {metadata} from '../index';
import {AmalaMetadataController, AmalaMetadataEndpoint, FlowFunction, RestVerb, StringOrRegex} from '../types/metadata';

export interface ValidationDecoratorOptions {
  validClass?: Function;
  required?: boolean;
  trim?: boolean;
}

type AddFlowProps = {
  flow: Array<FlowFunction>,
  methodName: string,
  object: Function | Record<string, any>
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
  object: Function | Record<string, any>,
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
  object: Record<string, any>,
  methodName: string
}

export function addVerbFunctionMeta({verb, paths, object, methodName}: AddVerbProps): void {

  const controller = metadata.controllers[object.constructor.name] || {};
  controller.endpoints = controller.endpoints || {};
  controller.endpoints[methodName] = controller.endpoints[methodName] || {};

  const argumentTypes: any[] = Reflect.getMetadata(
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
  controller.endpoints[methodName].targetMethod = object[methodName];

  metadata.controllers[object.constructor.name] = controller;
} // argument injection decorators


type AddArgumentProps = {
  index: number
  ctxKey: string
  ctxValueOptions: string | ValidationDecoratorOptions
  methodName: string
  object: Record<string, any>
}

export function addArgumentInjectMeta({
                                        index,
                                        ctxKey,
                                        ctxValueOptions,
                                        methodName,
                                        object
                                      }: AddArgumentProps) {
  // console.log('argument', stackConfig, injectSource, injectOptions, object, methodName);
  const controller: AmalaMetadataController = metadata.controllers[object.constructor.name] || {};

  controller.endpoints = controller.endpoints || {};
  controller.endpoints[methodName] = controller.endpoints[methodName] || <AmalaMetadataEndpoint>{};

  controller.endpoints[methodName].arguments =
    controller.endpoints[methodName].arguments || {};
  controller.endpoints[methodName].arguments[index] = {
    ctxKey: ctxKey,
    ctxValueOptions: ctxValueOptions
  };

  metadata.controllers[object.constructor.name] = controller;
}