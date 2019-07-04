import {importClassesFromDirectories} from './util/importClasses';
import {generateRoutes} from './util/generateRoutes';

export interface IJollofControllerOptions {
    basePath?: string;
    versions?: Array<number | string>;
    deprecatedVersions?: Array<number | string>;
    controllers: Array<string>;
    disableVersioning?: boolean;
}

export let options: IJollofControllerOptions;
export const metadata = {
    controllers: {}
};

export const bootstrapControllers = async (koaApp, router, params: IJollofControllerOptions) => {
    options = params;
    options.versions = options.versions || [1];
    options.deprecatedVersions = options.deprecatedVersions || [];

    importClassesFromDirectories(options.controllers);

    // console.log(inspect(metadata));

    await generateRoutes(router, options, metadata);

};

