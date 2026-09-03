import { ClassMethod, FlowFunction } from '../../types/metadata';
import { EmptyContext } from '../../types/context';
/**
 * Flow is an array of middleware you want to run prior to the controller endpoint.
 * This is where you implement constraints like authentication, authorization and similar pre-checks.
 * @param flow - A middleware or array of middleware
 * @constructor
 */
export declare function Flow<StateT extends object = EmptyContext, ContextT extends object = EmptyContext>(flow: FlowFunction<StateT, ContextT> | Array<FlowFunction<StateT, ContextT>>): (object: Function | ClassMethod, methodName?: string) => void;
