import {importClassesFromDirectories} from './util/importClasses';
import {generateRoutes} from './util/generateRoutes';
import * as bodyParser from 'koa-bodyparser';
import Boom from 'boom';

export interface IKoaControllerOptions {
    controllers: Array<string>;
    basePath?: string;
    versions?: Array<number | string>;
    deprecatedVersions?: Array<number | string>;
    disableVersioning?: boolean;
    initBodyParser?: boolean;
    boomifyErrors?: boolean;
    attachRoutes?:boolean;
    router?: any;
}

export let options: IKoaControllerOptions;
export const metadata = {
    controllers: {}
};

const handleRestErrors = async (ctx, next) => {
    try {
        await next();
    } catch (err) {

        if (err.isBoom) {
            const error = err.output.payload;
            error.errorDetails = err.data;
            ctx.body = error;
            ctx.status = error.statusCode;

            if (error.statusCode >= 500) console.error(err);
        } else {
            ctx.body = err;
            ctx.status = 500;
            console.error(err);
        }
    }
};

/**
 *
 * @param app - Koa instance
 * @param params - IKoaControllerOptions
 */
export const bootstrapControllers = async (app, params: IKoaControllerOptions) => {
    options = params;
    options.versions = options.versions || [1];
    options.deprecatedVersions = options.deprecatedVersions || [];

    if(!options.router){
        options.router = new (require('koa-router'))();
        options.attachRoutes = true;
    }

    importClassesFromDirectories(options.controllers);

    if (params.boomifyErrors) {
        // error handler
        app.use(handleRestErrors);
    }

    if (params.initBodyParser) {
        // Enable bodyParser with default options
        app.use((require('koa-body'))({ multipart: true }));
        // app.use((require('koa-bodyparser'))());
        // app.use(bodyParser());
    }

    if (options.attachRoutes) {
        // Combine routes
        app.use(options.router.routes());
        app.use(options.router.allowedMethods({
            methodNotAllowed: () => Boom.notFound(),
            notImplemented: () => Boom.notImplemented(),
            throw: true,
        }));
    }

    await generateRoutes(options.router, options, metadata);

};

export {
    Controller,
    Ctx,
    State,
    Body,
    Cookie,
    CurrentUser,
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

export * from 'class-validator'
