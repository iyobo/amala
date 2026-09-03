import Router from '@koa/router';
import { AmalaOptions } from '../types/AmalaOptions';
import { AmalaMetadata } from '../types/metadata';
import { EmptyContext } from '../types/context';
/**
 * Fill up router with routes
 * @param router
 * @param options
 * @param metadata
 */
export declare function generateRoutes<StateT extends object = EmptyContext, ContextT extends object = EmptyContext>(router: Router<StateT, ContextT>, options: AmalaOptions<StateT, ContextT>, metadata: AmalaMetadata<StateT, ContextT>): Promise<void>;
