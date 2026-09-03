import 'reflect-metadata';
import Router from '@koa/router';
import KoaApplication = require('koa');
import { AmalaOptions } from './types/AmalaOptions';
import { AmalaMetadata } from './types/metadata';
import { AmalaContext, EmptyContext } from './types/context';
import { addArgumentInjectMeta } from './decorators/common';
export declare let options: AmalaOptions;
export declare const metadata: AmalaMetadata;
export declare function getControllers(): Record<string, import("./types/metadata").AmalaMetadataController<EmptyContext, EmptyContext>>;
/**
 *
 * @param app - Koa instance
 * @param params - KoaControllerOptions
 */
export declare const bootstrapControllers: <StateT extends object = EmptyContext, ContextT extends object = EmptyContext>(params: AmalaOptions<StateT, ContextT>) => Promise<{
    app: KoaApplication<StateT, ContextT>;
    router: Router<StateT, ContextT>;
}>;
export * from 'class-validator';
export * from 'class-transformer';
/**
 * Allows for custom Decorators to be created by developers.
 */
export declare const addArgumentDecorator: typeof addArgumentInjectMeta;
export { errors } from './util/errors';
export type { AmalaOptions, ControllerClass, ControllerFactory, ErrorHandler } from './types/AmalaOptions';
export type { AmalaContext, AmalaMiddleware, AmalaNext, EmptyContext } from './types/context';
export type Context<StateT extends object = EmptyContext, ContextT extends object = EmptyContext, ResponseBodyT = unknown> = AmalaContext<StateT, ContextT, ResponseBodyT>;
export * from './decorators';
