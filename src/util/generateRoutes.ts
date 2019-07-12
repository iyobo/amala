import {IKoaControllerOptions} from '../index';
import {validate} from 'class-validator';
import {plainToClass} from 'class-transformer';
import _ from 'lodash';

const boom = require('boom');

async function _argumentInjectorProcessor(name, body, injectOptions) {

    if (!injectOptions) {
        return body;
    }

    if (typeof injectOptions === 'string') {
        return body[injectOptions];
    } else if (typeof injectOptions === 'object') {

        // is required
        if (injectOptions.required && (!body || _.isEmpty(body))) {
            throw boom.badData('Body: is required and cannot be null');
        }

        // is validatable
        if (injectOptions.validClass) {
            // transpose object to provided validClass
            const classBody = plainToClass(injectOptions.validClass, body);
            const errors = await validate(classBody);
            if (errors.length > 0) {
                // throw new Error('eeeh')
                // console.error(errors);
                throw boom.badData('validation error for argument type: ' + name,
                    errors.map(it => {
                        return {field: it.property, violations: it.constraints};
                    })
                );
            }

            return body;
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
        return _argumentInjectorProcessor('query', ctx.query, injectOptions);
    },
    body: async (ctx: any, injectOptions: any) => {
        return _argumentInjectorProcessor('body', ctx.request.body, injectOptions);
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

async function _generateEndPoints(router, options: IKoaControllerOptions, controller, parentPath: string, generatingForVersion: string | number) {
    const actions = controller.actions;

    _.each(actions, (action, name) => {

        let willAddEndpoint = true;

        // If API versioning mode is active...
        if (generatingForVersion) {

            // ...and endpoint has some version constraints defined...
            if (action.limitToVersions && !_.isEmpty(action.limitToVersions)) {

                // ...and current endpoint version being generated does NOT exist in the constraint
                if (!action.limitToVersions[generatingForVersion]) {
                    // then ignore this endpoint
                    willAddEndpoint = false;
                }

            }
        }


        if (willAddEndpoint) {
            const path = parentPath + action.path;

            const flow = [
                ...(options.flow || []),
                ...(controller.flow || []),
                ...(action.flow || [])
            ];

            flow.push(async function (ctx) {

                const targetArguments = [];

                if (options.versions && typeof options.versions[generatingForVersion] === 'string') {
                    ctx.headers.Deprecation = options.versions[generatingForVersion];
                }

                // inject data into arguments
                if (action.arguments) {
                    for (const index of Object.keys(action.arguments)) {
                        targetArguments[index] = await _determineArgument(ctx, index, action.arguments[index]);
                    }
                }

                // run target endpoint handler
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
export async function generateRoutes(router, options: IKoaControllerOptions, metadata) {

    const basePath = options.basePath || ''; // e.g /api

    _.each(metadata.controllers, async (controller) => {

        if (options.disableVersioning) {
            // e.g /api/users
            await _generateEndPoints(router, options, controller, basePath + controller.path, undefined,);
        } else {
            // e.g /api/v1/user
            _.each(options.versions, async (status, version) => {
                await _generateEndPoints(router, options, controller, basePath + `/v${version}` + controller.path, version);
            });
        }

    });
}
