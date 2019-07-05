import {importClassesFromDirectories} from './util/importClasses';
import {generateRoutes} from './util/generateRoutes';
import bodyParser from 'koa-bodyparser';

export interface IKoaControllerOptions {
    controllers: Array<string>;
    basePath?: string;
    versions?: Array<number | string>;
    deprecatedVersions?: Array<number | string>;
    disableVersioning?: boolean;
    initBodyParser?: boolean;
    boomifyErrors?: boolean;
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

export const bootstrapControllers = async (koaApp, router, params: IKoaControllerOptions) => {
    options = params;
    options.versions = options.versions || [1];
    options.deprecatedVersions = options.deprecatedVersions || [];

    importClassesFromDirectories(options.controllers);

    // console.log(inspect(metadata));

    if(params.boomifyErrors){
        // error handler
        koaApp.use(handleRestErrors);
    }

    if(params.initBodyParser){
        // Enable bodyParser with default options
        koaApp.use(bodyParser());
    }

    await generateRoutes(router, options, metadata);

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
