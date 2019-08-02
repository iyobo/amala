import {importClassesFromDirectories} from './util/importClasses';
import {generateRoutes} from './util/generateRoutes';
import * as bodyParser from 'koa-bodyparser';
import Boom from '@hapi/boom';
import cookie from 'koa-cookie';

export interface IKoaControllerOptions {
    controllers: Array<string>;
    basePath?: string;
    versions?: Array<number | string> | object;
    disableVersioning?: boolean;
    initBodyParser?: boolean;
    boomifyErrors?: boolean;
    attachRoutes?: boolean;
    router?: any;
    flow?: Array<Function>;
}

export let options: IKoaControllerOptions;
export const metadata = {
    controllers: {}
};

interface ControllerCodex {
    [k: string]: {
        actions: {
            [ak: string]: {
                flow?: Array<Function>;
                verb: string;
                path: string;
                target: Function;
                argumentTypes?: Array<any>;
            }
        };
        path: String;
        class: any;
    };
}

export function getControllers(): ControllerCodex {
    return metadata.controllers;
}

const handleRestErrors = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (err.isBoom) {
            const error = err.output.payload;
            error.errorDetails = error.statusCode >= 500 ? null : err.data;
            ctx.body = error;
            ctx.status = error.statusCode;
            if (error.statusCode >= 500)
                console.error(err);
        } else {
            ctx.body = {error: 'Internal Server Error'};
            ctx.status = 500;
            console.error(err);
        }
    }
};

export let controllers = {};

/**
 *
 * @param app - Koa instance
 * @param params - IKoaControllerOptions
 */
export const bootstrapControllers = async (app, params: IKoaControllerOptions) => {
    options = params;
    options.versions = options.versions || {1: true};
    options.flow = options.flow || [];
    options.boomifyErrors = params.boomifyErrors === false ? false : true;

    /**
     * Versions can be defined in multiple ways.
     * If an array, it's just a list of active versions.
     * If as an object, then this datastructure can define not only active versions but obsolete versions as well.
     *
     * The object is the native form. Arrays are converted to object.
     */
    if (Array.isArray(options.versions)) {
        const versions = {};

        options.versions.forEach(version => {
            versions[version] = true;
        });
        options.versions = versions;
    }


    if (!options.router) {
        options.router = new (require('koa-router'))();
        options.attachRoutes = true;
    }

    if (options.boomifyErrors) {
        // error handler
        app.use(handleRestErrors);
    }

    importClassesFromDirectories(options.controllers);

    if (params.initBodyParser) {
        // Enable bodyParser with default options
        app.use((require('koa-body'))({multipart: true}));
        // app.use((require('koa-bodyparser'))());
        // app.use(bodyParser());
    }

    // parses cookies
    app.use(cookie());


    await generateRoutes(options.router, options, metadata);

    if (options.attachRoutes) {
        // Combine routes
        app.use(options.router.routes());
        app.use(options.router.allowedMethods({
            methodNotAllowed: () => Boom.notFound(),
            notImplemented: () => Boom.notImplemented(),
            throw: true,
        }));
    }

};

export {
    Controller,
    Ctx,
    State,
    Body,
    Cookie,
    Delete,
    Flow,
    Get,
    Header,
    Params,
    Patch,
    Post,
    Put,
    Query,
    Req,
    Res,
    Session,
    Version
} from './decorators';

export * from 'class-validator';
