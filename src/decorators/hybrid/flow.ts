import {addFlowFunctionMeta} from '../common';
import {metadata} from '../../index';
import {ensureArray} from '../../util/tools';
import {ClassMethod, FlowFunction} from '../../types/metadata';
import {EmptyContext} from '../../types/context';

/**
 * Flow is an array of middleware you want to run prior to the controller endpoint.
 * This is where you implement constraints like authentication, authorization and similar pre-checks.
 * @param flow - A middleware or array of middleware
 * @constructor
 */
export function Flow<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext
>(flow: FlowFunction<StateT, ContextT> | Array<FlowFunction<StateT, ContextT>>) {
  return function (object: Function | ClassMethod, methodName?: string) {
    if (typeof object === "object") {
      // endpoint
      addFlowFunctionMeta({flow: ensureArray(flow), methodName, object});
    } else if (typeof object === "function") {
      // controller

      const controller = metadata.controllers[object.name] || {};
      controller.flow = ensureArray(flow);
      metadata.controllers[object.name] = controller;
    }
  };
}
