import {metadata} from './index';

export function Controller(baseRoute?: string) {
    return function (object: Function) {
        // console.log('Controller', object);
        const controller = metadata.controllers[object.name] || {};
        controller.path = baseRoute;

        metadata.controllers[object.name] = controller;
    };
}

// Function decorators
function _addVerbFunctionMeta({verb, path, methodName, object}) {
    // console.log(verb, path, object, methodName);
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};

    controller.actions[methodName].verb = verb;
    controller.actions[methodName].path = path;
    controller.actions[methodName].target = object[methodName];

    metadata.controllers[object.constructor.name] = controller;
}

function _addVersionFunctionMeta({version, methodName, object, endpointDeprecationWarning}) {
    // console.log('version', version, object, methodName);
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};

    // The presence of versions signifies that this method might be unavailable for some versions and should be skipped in final metadata processing step
    controller.actions[methodName].limitToVersions = controller.actions[methodName].limitToVersions || {};
    controller.actions[methodName].limitToVersions[version] = endpointDeprecationWarning || true;

    metadata.controllers[object.constructor.name] = controller;
}

function _addFlowFunctionMeta({flow, methodName, object}) {
    const flowArray = Array.isArray(flow) ? flow : [flow];
    // console.log('flow count', flowArray.length, methodName);

    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};

    controller.actions[methodName].flow = flowArray;

    metadata.controllers[object.constructor.name] = controller;
}

export function Get(path: string | RegExp) {
    return function (object: Object, methodName: string) {
        _addVerbFunctionMeta({verb: 'get', methodName, path, object});
    };
}

export function Post(path: string | RegExp) {
    return function (object: Object, methodName: string) {
        _addVerbFunctionMeta({verb: 'post', methodName, path, object});
    };
}

export function Put(path: string | RegExp) {
    return function (object: Object, methodName: string) {
        _addVerbFunctionMeta({verb: 'put', methodName, path, object});
    };
}

export function Patch(path: string | RegExp) {
    return function (object: Object, methodName: string) {
        _addVerbFunctionMeta({verb: 'patch', methodName, path, object});
    };
}

export function Delete(path: string | RegExp) {
    return function (object: Object, methodName: string) {
        _addVerbFunctionMeta({verb: 'delete', methodName, path, object});
    };
}

export function Version(version: string, endpointDeprecationWarning?: string) {
    return function (object: Object, methodName: string) {
        _addVersionFunctionMeta({object, methodName, version, endpointDeprecationWarning});
    };
}

/**
 * Flow is an array of middleware you want to run prior to the controller action.
 * This is where you implement constraints like authentication, authorization and similar pre-checks.
 * @param flow
 * @constructor
 */
export function Flow(flow: Function | Array<Function>) {
    return function (object: Function | Object, methodName?: string) {
        if (typeof object === 'object') { // action

            _addFlowFunctionMeta({flow, methodName, object});
        } else if (typeof object === 'function') { // controller

            const controller = metadata.controllers[object.name] || {};
            controller.flow = flow;
            metadata.controllers[object.name] = controller;
        }
    };
}


// argument injection decorators
function _addArgumentInjectMeta({index, injectSource, injectOptions, methodName, object}) {
    // console.log('argument', stackConfig, injectSource, injectOptions, object, methodName);
    const controller = metadata.controllers[object.constructor.name] || {};
    controller.actions = controller.actions || {};
    controller.actions[methodName] = controller.actions[methodName] || {};

    // The presence of versions signifies that this method might be unavailable for some versions and should be skipped in final metadata processing step
    controller.actions[methodName].arguments = controller.actions[methodName].arguments || {};
    controller.actions[methodName].arguments[index] = {injectSource, injectOptions};

    metadata.controllers[object.constructor.name] = controller;
}

export function Header(injectOptions?: string | Object) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'header', injectOptions, methodName, object});
    };
}

export interface IValidationDecoratorOptions {
    validClass?: Function;
    required?: boolean;
    trim?: boolean;
}

export function Body(injectOptions?: string | IValidationDecoratorOptions) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'body', injectOptions, methodName, object});
    };
}

export function Session(injectOptions?: string | Object) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'session', injectOptions, methodName, object});
    };
}

export function State(injectOptions?: string | Object) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'state', injectOptions, methodName, object});
    };
}

export function Cookie(injectOptions?: string | Object) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'cookie', injectOptions, methodName, object});
    };
}

export function Req(injectOptions?: string | Object) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'req', injectOptions, methodName, object});
    };
}

export function Res(injectOptions?: string | Object) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'res', injectOptions, methodName, object});
    };
}

export function Params(injectOptions?: string | Object) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'params', injectOptions, methodName, object});
    };
}

export function Query(injectOptions?: string | IValidationDecoratorOptions) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'query', injectOptions, methodName, object});
    };
}

export function CurrentUser(injectOptions?: string | Object) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'currentUser', injectOptions, methodName, object});
    };
}

/**
 * OBSOLETE:
 * Direct file upload is not reccomended for server.
 * Client should handle upload of content to S3-compatible service by itself.
 * If it is a private/encrypted file, client can hit an endpoint from the server to create and send the client a key
 * which is then stored and can be used to encrypt the file.
 */
// export function UploadedFile(injectOptions?: string | Object) {
//     return function (object: Object, methodName: string, stackConfig: number) {
//         _addArgumentInjectMeta({stackConfig, injectSource: 'uploadedFile', injectOptions, methodName, object});
//     };
// }

/**
 * Injects the full Koa context. Try not to do this if you don't have to.
 * @param injectOptions
 * @constructor
 */
export function Ctx(injectOptions?: string | Object) {
    return function (object: Object, methodName: string, index: number) {
        _addArgumentInjectMeta({index, injectSource: 'ctx', injectOptions, methodName, object});
    };
}

