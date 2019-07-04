import {IKoaControllerOptions} from '../index';
import {validate} from "class-validator";

const _ = require('lodash');

const argumentInjectorMap = {
    currentUser: async (ctx: any, injectOptions: any) => {
        return ctx.state.user;
    },
    ctx: async (ctx: any, injectOptions: any) => ctx,
    body: async (ctx: any, injectOptions: any) => ctx.request.body,
};


async function _determineArgument(ctx, index, {injectSource, injectOptions}) {
    let result;

    // TODO: implement all special argument injectors. Specials are defined in the argumentInjectorMap
    if (argumentInjectorMap[injectSource]) {
        result = await argumentInjectorMap[injectSource](ctx, injectOptions);
    } else {
        // not a special arg injector? Try to pull argument from ctx
        result = ctx[injectSource];
        if (result && injectOptions) {
            result = result[injectOptions];
        }
    }

    // await validate();

    return result;
}


async function _generateEndPoints(router, options: IKoaControllerOptions, actions, parentPath: string, version: string | number) {
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

            //TODO: prepend controller defined flow to support class nested flows
            const flow = action.flow || [];
            flow.push(async (ctx) => {

                const targetArguments = [];

                //inject data into arguments
                for (const index of Object.keys(action.arguments)) {
                    targetArguments[index] = await _determineArgument(ctx, index, action.arguments[index]);
                }

                //run target endpoint handler
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
export function generateRoutes(router, options: IKoaControllerOptions, metadata) {

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