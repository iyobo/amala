import "reflect-metadata";
import { metadata } from "./index";
import {addArgumentInjectMeta} from './util/tools';

export function Controller(baseRoute?: string | string[]) {
  return function(classDefinition: Function): void {
    const controller = metadata.controllers[classDefinition.name] || {};
    controller.path = baseRoute;
    controller.class = classDefinition;

    metadata.controllers[classDefinition.name] = controller;
  };
}

// Function decorators
function _addVerbFunctionMeta({ verb, path, object, methodName }: any): void {
  const controller = metadata.controllers[object.constructor.name] || {};
  controller.actions = controller.actions || {};
  controller.actions[methodName] = controller.actions[methodName] || {};

  const argumentTypes = Reflect.getMetadata(
    "design:paramtypes",
    object,
    methodName
  );

  controller.actions[methodName].verb = verb;
  controller.actions[methodName].path = path;
  controller.actions[methodName].target = object[methodName];
  controller.actions[methodName].argumentTypes = argumentTypes;

  metadata.controllers[object.constructor.name] = controller;
}

function _addVersionFunctionMeta({
  version,
  methodName,
  object,
  endpointDeprecationWarning
}: any): void {
  const controller = metadata.controllers[object.constructor.name] || {};
  controller.actions = controller.actions || {};
  controller.actions[methodName] = controller.actions[methodName] || {};

  // The presence of versions signifies that this method might be unavailable for some versions and should
  // be skipped in final metadata processing step
  controller.actions[methodName].limitToVersions =
    controller.actions[methodName].limitToVersions || {};
  controller.actions[methodName].limitToVersions[version] =
    endpointDeprecationWarning || true;

  metadata.controllers[object.constructor.name] = controller;
}

function _addFlowFunctionMeta({ flow, methodName, object }: any): void {
  const flowArray = Array.isArray(flow) ? flow : [flow];

  const controller = metadata.controllers[object.constructor.name] || {};
  controller.actions = controller.actions || {};
  controller.actions[methodName] = controller.actions[methodName] || {};

  controller.actions[methodName].flow = flowArray;

  metadata.controllers[object.constructor.name] = controller;
}

export function Get(path: string | RegExp) {
  return function(object: Record<string, any>, methodName: string): void {
    _addVerbFunctionMeta({ verb: "get", methodName, path, object });
  };
}

export function Post(path: string | RegExp) {
  return function(object: Record<string, any>, methodName: string): void {
    _addVerbFunctionMeta({ verb: "post", methodName, path, object });
  };
}

export function Put(path: string | RegExp) {
  return function(object: Record<string, any>, methodName: string): void {
    _addVerbFunctionMeta({ verb: "put", methodName, path, object });
  };
}

export function Patch(path: string | RegExp) {
  return function(object: Record<string, any>, methodName: string): void {
    _addVerbFunctionMeta({ verb: "patch", methodName, path, object });
  };
}

export function Delete(path: string | RegExp) {
  return function(object: Record<string, any>, methodName: string): void {
    _addVerbFunctionMeta({ verb: "delete", methodName, path, object });
  };
}

export function Version(version: string, endpointDeprecationWarning?: string) {
  return function(object: Record<string, any>, methodName: string): void {
    _addVersionFunctionMeta({
      object,
      methodName,
      version,
      endpointDeprecationWarning
    });
  };
}

/**
 * Flow is an array of middleware you want to run prior to the controller action.
 * This is where you implement constraints like authentication, authorization and similar pre-checks.
 * @param flow
 * @constructor
 */
export function Flow(flow: Function | Array<Function>) {
  return function(object: Function | Record<string, any>, methodName?: string) {
    if (typeof object === "object") {
      // action

      _addFlowFunctionMeta({ flow, methodName, object });
    } else if (typeof object === "function") {
      // controller

      const controller = metadata.controllers[object.name] || {};
      controller.flow = flow;
      metadata.controllers[object.name] = controller;
    }
  };
}

export function Header(injectOptions?: string | Record<string, any>) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ) {
    addArgumentInjectMeta({
      index,
      injectSource: "header",
      injectOptions,
      methodName,
      object
    });
  };
}

export interface ValidationDecoratorOptions {
  validClass?: Function;
  required?: boolean;
  trim?: boolean;
}

export function Body(injectOptions?: string | ValidationDecoratorOptions) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "body",
      injectOptions,
      methodName,
      object
    });
  };
}

export function Session(injectOptions?: string | Record<string, any>) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "session",
      injectOptions,
      methodName,
      object
    });
  };
}

export function CurrentUser(injectOptions?: string | Record<string, any>) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "currentUser",
      injectOptions,
      methodName,
      object
    });
  };
}

export function State(injectOptions?: string | Record<string, any>) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "state",
      injectOptions,
      methodName,
      object
    });
  };
}

export function Req(injectOptions?: string | Record<string, any>) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "req",
      injectOptions,
      methodName,
      object
    });
  };
}

export function Res(injectOptions?: string | Record<string, any>) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "res",
      injectOptions,
      methodName,
      object
    });
  };
}

export function Params(injectOptions?: string | Record<string, any>) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "params",
      injectOptions,
      methodName,
      object
    });
  };
}

export function Query(injectOptions?: string | ValidationDecoratorOptions) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "query",
      injectOptions,
      methodName,
      object
    });
  };
}
/**
 * Injects the full Koa context. Try not to do this if you don't have to.
 * @param injectOptions
 * @constructor
 */
export function Ctx(injectOptions?: string | Record<string, any>) {
  return function(
    object: Record<string, any>,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      injectSource: "ctx",
      injectOptions,
      methodName,
      object
    });
  };
}
