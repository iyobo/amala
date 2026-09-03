
import type {AmalaMiddleware, EmptyContext} from './context';

export type Class<T = object> = new (...args: never[]) => T;
export type FlowFunction<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext
> = AmalaMiddleware<StateT, ContextT>;

export type RestVerb = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type StringOrRegex = string | RegExp

export type ClassMethod = object

export type AmalaMetadataArgument = {
  ctxKey?: string,
  ctxValueOptions?: unknown,
  argType?: Class
}

export interface AmalaMetadataEndpoint<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext
> {

  /**
   * HTTP verb for this endpoint.
   * Ex: 'get' | 'post' | 'put' | 'patch' | 'delete'
   */
  verb?: RestVerb,

  /**
   * List of middleware to be ran, in order, before arriving at this endpoint
   */
  flow?: FlowFunction<StateT, ContextT>[]

  /**
   * List of paths that point to this endpoint
   */
  paths?: StringOrRegex[],

  /**
   * All argument injection happens from ctx, in order of their definition.
   * ctx[ctxKey](ctxValueOptions)
   */
  arguments?: Record<number, AmalaMetadataArgument>,

  /**
   * The defined types of the injected arguments, as derived from Reflect metadata
   */
  returnType?: unknown,

  /**
   * The async class method that serves as this endpoint
   */
  targetMethod?: (...args: unknown[]) => unknown

  /**
   * If any are defined here, will only add this endpoint to these versions
   */
  limitToVersions?: Record<string | number, string | boolean>;
}

export interface AmalaMetadataController<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext
> {
  /**
   * The class that serves as this controller
   */
  targetClass?: Class;

  /**
   * List of middleware to be run, in order, before entering this controller's endpoints.
   * If those endpoints also have flow defined, they will run after these are done.
   */
  flow?: FlowFunction<StateT, ContextT>[],

  /**
   * List of paths that point to this controller
   */
  paths?: StringOrRegex[],

  /**
   * The endpoints within this controller; keyed by the endpoint's associated method Name.
   */
  endpoints?: Record<string, AmalaMetadataEndpoint<StateT, ContextT>>
}

export interface AmalaMetadata<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext
> {
  /**
   * The controllers recognized by Amala; keyed by the controller's associated class name
   */
  controllers: Record<string, AmalaMetadataController<StateT, ContextT>>;
}
