import {importClassesFromDirectories} from './util/importClasses';
import {generateRoutes} from './util/generateRoutes';

export interface IKoaControllerOptions {
    basePath?: string;
    versions?: Array<number | string>;
    deprecatedVersions?: Array<number | string>;
    controllers: Array<string>;
    disableVersioning?: boolean;
}

export let options: IKoaControllerOptions;
export const metadata = {
    controllers: {}
};

export const bootstrapControllers = async (koaApp, router, params: IKoaControllerOptions) => {
    options = params;
    options.versions = options.versions || [1];
    options.deprecatedVersions = options.deprecatedVersions || [];

    importClassesFromDirectories(options.controllers);

    // console.log(inspect(metadata));

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