/// <reference types="koa__router" />
/// <reference types="koa__cors" />
import { Options } from '@koa/cors';
import Router from '@koa/router';
import { ValidatorOptions } from 'class-validator';
import { HelmetOptions } from 'helmet';
import Application from 'koa';
import { OpenAPIV3_1 } from 'openapi-types';
import { KoaBodyOptions } from './KoaBodyOptions';
import { FlowFunction } from './metadata';
export interface AmalaOptions {
    /** For If you want to supply your own koa application instance.
     * If this is not provided, amala will create a koa application for you.
     * Either way, an app is returned within the result of running the bootstrap function.
     **/
    app?: Application;
    router?: Router;
    controllers: Array<string | Function>;
    basePath?: string;
    versions?: Array<number | string> | {
        [key: string]: string | boolean;
    };
    disableVersioning?: boolean;
    flow?: FlowFunction[];
    errorHandler?: (err: any, ctx: any) => Promise<void>;
    attachRoutes?: boolean;
    validatorOptions?: ValidatorOptions;
    /**
     * OpenAPI options
     */
    openAPI?: {
        enabled: boolean;
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
        publicURL: string;
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
    bodyParser?: false | KoaBodyOptions;
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
