import {IKoaControllerOptions} from "../index";
import {validate} from "class-validator";
import {plainToClass} from "class-transformer";
import _ from "lodash";

const boom = require("boom");

async function _argumentInjectorProcessor(name, body, injectOptions) {

    if (!injectOptions) {
        return body;
    }

    if (typeof injectOptions === "string") {
        return body[injectOptions];
    } else if (typeof injectOptions === "object") {

        //is required
        if (injectOptions.required && (!body || !_.isEmpty(body))) {
            throw boom.badData("Body: is required and cannot be null");
        }

        //is validatable
        if (injectOptions.validClass) {
            //transpose object to provided validClass
            const classBody = plainToClass(injectOptions.validClass, body);
            const errors = await validate(classBody);
            if (errors.length > 0) {
                // throw new Error('eeeh')
                // console.error(errors);
                throw boom.badData("validation error for argument injector: " + name, errors);
            }

            return classBody;
        }

        return body;
    }

    throw boom.badImplementation(`${name}: Cannot handle injection options ${injectOptions}`);
}

const argumentInjectorMap = {
    currentUser: async (ctx: any, injectOptions: any) => {
        return ctx.state.user;
    },
    ctx: async (ctx: any, injectOptions: any) => ctx,
    query: async (ctx: any, injectOptions: any) => {
        return _argumentInjectorProcessor("query", ctx.query, injectOptions);
    },
    body: async (ctx: any, injectOptions: any) => {
        return _argumentInjectorProcessor("body", ctx.request.body, injectOptions);
    },
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
            flow.push(async function(ctx) {

                const targetArguments = [];

                //inject data into arguments
                if (action.arguments) {
                    for (const index of Object.keys(action.arguments)) {
                        targetArguments[index] = await _determineArgument(ctx, index, action.arguments[index]);
                    }
                }

                //run target endpoint handler
                ctx.body = await action.target(...targetArguments);
            });

            router[action.verb](path, ...flow);
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

    const basePath = options.basePath || ""; // /api

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
