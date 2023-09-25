
export type Class<T = any> = new (...args: any[]) => T;
export type FlowFunction = (ctx, next) => Promise<void>

export type RestVerb = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type StringOrRegex = string | RegExp

export type ClassMethod = Record<string, any>

export type AmalaMetadataArgument = {
  ctxKey?: string,
  ctxValueOptions?: any,
  argType?: any
}

export interface AmalaMetadataEndpoint {

  /**
   * HTTP verb for this endpoint.
   * Ex: 'get' | 'post' | 'put' | 'patch' | 'delete'
   */
  verb?: RestVerb,

  /**
   * List of middleware to be ran, in order, before arriving at this endpoint
   */
  flow?: FlowFunction[]

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
  returnType?: any,

  /**
   * The async class method that serves as this endpoint
   */
  targetMethod?: () => Promise<unknown>

  /**
   * If any are defined here, will only add this endpoint to these versions
   */
  limitToVersions?: Record<string | number, string | boolean>;
}

export interface AmalaMetadataController {
  /**
   * The class that serves as this controller
   */
  targetClass?: Class;

  /**
   * List of middleware to be run, in order, before entering this controller's endpoints.
   * If those endpoints also have flow defined, they will run after these are done.
   */
  flow?: FlowFunction[],

  /**
   * List of paths that point to this controller
   */
  paths?: StringOrRegex[],

  /**
   * The endpoints within this controller; keyed by the endpoint's associated method Name.
   */
  endpoints?: Record<string, AmalaMetadataEndpoint>
}

export interface AmalaMetadata {
  /**
   * The controllers recognized by Amala; keyed by the controller's associated class name
   */
  controllers: Record<string, AmalaMetadataController>;
}