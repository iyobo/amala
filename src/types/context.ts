import type KoaApplication = require('koa');

/** A property-free default that does not inherit Koa's `any` index signature. */
export type EmptyContext = Record<never, never>;

/**
 * The Koa context used by Amala.
 *
 * Supply application state and context extensions to make middleware,
 * factories, error handlers, and bootstrap results share one contract.
 */
export type AmalaContext<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext,
  ResponseBodyT = unknown
> = KoaApplication.ParameterizedContext<StateT, ContextT, ResponseBodyT>;

/** Koa's downstream middleware continuation without an `any` result. */
export type AmalaNext = () => Promise<unknown>;

/** Middleware whose context preserves the application's state and extensions. */
export type AmalaMiddleware<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext
> = (
  ctx: AmalaContext<StateT, ContextT>,
  next: AmalaNext
) => unknown | Promise<unknown>;
