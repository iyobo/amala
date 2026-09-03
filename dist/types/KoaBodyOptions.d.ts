import type { KoaBodyMiddlewareOptions } from 'koa-body';
import type { AmalaContext, EmptyContext } from './context';
/**
 * koa-body options with Amala's application state and context extensions
 * preserved in the error callback.
 */
export type KoaBodyOptions<StateT extends object = EmptyContext, ContextT extends object = EmptyContext> = Omit<Partial<KoaBodyMiddlewareOptions>, 'onError'> & {
    onError?: (error: Error, context: AmalaContext<StateT, ContextT>) => void;
};
