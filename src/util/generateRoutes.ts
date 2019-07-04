import {IJollofControllerOptions} from '../index';

const _ = require('lodash');

const argumentInjectorMap = {
    currentUser: async (ctx: any, injectOptions: any) => {
        return ctx.state.user;
    },
    ctx: async (ctx: any, injectOptions: any) => ctx,
    body: async (ctx: any, injectOptions: any) => ctx.request.body,
};


async function _determineArgument(ctx, {injectSource, injectOptions}) {
    let result;

    // TODO: implement all special injectors
    if (argumentInjectorMap[injectSource]) {
        result = await argumentInjectorMap[injectSource](ctx, injectOptions);
    } else {
        // not a special arg injector. Try pull argument from ctx
        result = ctx[injectSource];
        if (result && injectOptions) {
            result = result[injectOptions];
        }
    }

    return result;
}


async function _generateEndPoints(router, options: IJollofControllerOptions, actions, parentPath: string, version: string | number) {
    _.each(actions, (action, name) => {

        let willAddEndpoint = false;
        // 404 if endpoint is versioned
        if (action.versions && version) {
            // ...and currently iterated api version is included in endpoint's version stackConfig
            if (actions.versions[version]) {
                willAddEndpoint = true;
            }
        } else {
            willAddEndpoint = true;
        }

        if (willAddEndpoint) {
            const path = parentPath + action.path;

            const flow = action.flow || [];
            flow.push(async (ctx) => {

                const targetArguments = [];

                for (const k of Object.keys(action.arguments)) {
                    targetArguments[k] = await _determineArgument(ctx, action.arguments[k]);
                }

                ctx.body = await action.target(...targetArguments);
            });

            router[action.verb](path,
                ...flow
            );
        }
    });
}

/**
 * Fill up router with routes
 * @param router
 * @param options
 * @param metadata
 */
export function generateRoutes(router, options: IJollofControllerOptions, metadata) {

    const basePath = options.basePath || ''; // /api

    _.each(metadata.controllers, (controller) => {

        // const controllerPath = basePath + controller.path; // /api/v1

        // TODO: Do versioning loop here
        if (options.disableVersioning) {

            _generateEndPoints(router, options, controller.actions, basePath + controller.path, undefined);
        } else {
            options.versions.forEach((version) => {
                _generateEndPoints(router, options, controller.actions, basePath + `/v${version}` + controller.path, version);
            });
        }

    });
}