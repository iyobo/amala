import { ClassMethod, FlowFunction } from '../../types/metadata';
/**
 * Flow is an array of middleware you want to run prior to the controller endpoint.
 * This is where you implement constraints like authentication, authorization and similar pre-checks.
 * @param flow - A middleware or array of middleware
 * @constructor
 */
export declare function Flow(flow: FlowFunction | Array<FlowFunction>): (object: Function | ClassMethod, methodName?: string) => void;
