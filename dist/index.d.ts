import 'reflect-metadata';
import Router from '@koa/router';
import KoaApplication from 'koa';
import { AmalaOptions } from './types/AmalaOptions';
import { AmalaMetadata } from './types/metadata';
import { addArgumentInjectMeta } from './decorators/common';
export declare let options: AmalaOptions;
export declare const metadata: AmalaMetadata;
export declare function getControllers(): Record<string, import("./types/metadata").AmalaMetadataController>;
/**
 *
 * @param app - Koa instance
 * @param params - KoaControllerOptions
 */
export declare const bootstrapControllers: (params: AmalaOptions) => Promise<{
    app: KoaApplication;
    router: Router;
}>;
export * from 'class-validator';
export * from 'class-transformer';
/**
 * Allows for custom Decorators to be created by developers.
 */
export declare const addArgumentDecorator: typeof addArgumentInjectMeta;
export { errors } from './util/errors';
export type Context = KoaApplication.Context;
export * from './decorators';
