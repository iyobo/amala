import { Options } from '@koa/cors';
import Router from '@koa/router';
import { ValidatorOptions } from 'class-validator';
import type { HelmetOptions } from 'helmet';
import type Application = require('koa');
import { OpenAPIV3_1 } from 'openapi-types';
import { KoaBodyOptions } from './KoaBodyOptions';
import { FlowFunction } from './metadata';
import { AmalaContext, EmptyContext } from './context';
export type ControllerClass = new (...args: unknown[]) => object;
export type ControllerFactory<StateT extends object = EmptyContext, ContextT extends object = EmptyContext> = (controllerClass: ControllerClass, ctx: AmalaContext<StateT, ContextT>) => object | Promise<object>;
export type ErrorHandler<StateT extends object = EmptyContext, ContextT extends object = EmptyContext> = (err: unknown, ctx: AmalaContext<StateT, ContextT>) => void | Promise<void>;
export interface AmalaOptions<StateT extends object = EmptyContext, ContextT extends object = EmptyContext> {
    /** For If you want to supply your own koa application instance.
     * If this is not provided, amala will create a koa application for you.
     * Either way, an app is returned within the result of running the bootstrap function.
     **/
    app?: Application<StateT, ContextT>;
    router?: Router<StateT, ContextT>;
    controllers: Array<string | Function>;
    /**
     * Resolve a controller instance for each request. The default behavior is
     * equivalent to `(ControllerClass, ctx) => new ControllerClass(ctx)`.
     * Applications own any custom construction strategy and service lifecycle.
     */
    controllerFactory?: ControllerFactory<StateT, ContextT>;
    basePath?: string;
    versions?: Array<number | string> | {
        [key: string]: string | boolean;
    };
    disableVersioning?: boolean;
    flow?: FlowFunction<StateT, ContextT>[];
    errorHandler?: ErrorHandler<StateT, ContextT>;
    attachRoutes?: boolean;
    validatorOptions?: ValidatorOptions;
    /**
     * OpenAPI options
     */
    openAPI?: {
        enabled?: boolean;
        /**
         * URL path to serve openAPI UI
         */
        webPath?: string;
        /**
         * URL path to serve openAPi spec. Default: "/api/docs"
         */
        specPath?: string;
        /**
         * What is the public URL for this API?
         */
        publicURL?: string;
        /**
         * Use this to Pre-fill certain aspects of the OpenAPI spec e.g to define "info" segment.
         */
        spec?: Partial<{
            info: Partial<OpenAPIV3_1.InfoObject>;
            servers?: OpenAPIV3_1.ServerObject[];
            paths: Partial<OpenAPIV3_1.PathsObject>;
            components?: Partial<OpenAPIV3_1.ComponentsObject>;
            security?: Partial<OpenAPIV3_1.SecurityRequirementObject>[];
            tags?: Partial<OpenAPIV3_1.TagObject[]>;
            externalDocs?: Partial<OpenAPIV3_1.ExternalDocumentationObject>;
        }>;
    };
    bodyParser?: false | KoaBodyOptions<StateT, ContextT>;
    /**
     * Will use koa helmet
     */
    useHelmet?: true | HelmetOptions;
    /**
     * Logs more processed for diagnostics.
     */
    diagnostics?: boolean;
    /**
     * Cors is enabled by default.
     * Set enabled to false to disable Amala's implementation of Cors.
     * `opts` are @koa/cors settings.
     */
    cors?: {
        enabled: boolean;
        opts?: Options;
    };
}
