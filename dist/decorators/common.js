"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStandardSchema = isStandardSchema;
exports.resolveValidationDecoratorInput = resolveValidationDecoratorInput;
exports.addFlowFunctionMeta = addFlowFunctionMeta;
exports.addVersionFunctionMeta = addVersionFunctionMeta;
exports.addVerbFunctionMeta = addVerbFunctionMeta;
exports.addArgumentInjectMeta = addArgumentInjectMeta;
require("reflect-metadata");
const index_1 = require("../index");
function isStandardSchema(value) {
    if ((typeof value !== 'object' && typeof value !== 'function')
        || value === null) {
        return false;
    }
    const standard = value["~standard"];
    if (!standard || typeof standard !== 'object')
        return false;
    const props = standard;
    return props.version === 1 && typeof props.validate === 'function';
}
function resolveValidationDecoratorInput(input, propertySchema) {
    if (propertySchema) {
        if (typeof input !== 'string') {
            throw new TypeError('A property name is required when a second Standard Schema argument is supplied');
        }
        return { injectOptions: input, standardSchema: propertySchema };
    }
    if (isStandardSchema(input))
        return { standardSchema: input };
    return { injectOptions: input };
}
function addFlowFunctionMeta({ flow, methodName, object }) {
    const controller = index_1.metadata.controllers[object.constructor.name] || {};
    controller.endpoints = controller.endpoints || {};
    controller.endpoints[methodName] = controller.endpoints[methodName] || {};
    controller.endpoints[methodName].flow = controller.endpoints[methodName].flow || [];
    controller.endpoints[methodName].flow = [...controller.endpoints[methodName].flow, ...flow];
    index_1.metadata.controllers[object.constructor.name] = controller;
}
function addVersionFunctionMeta({ version, methodName, object, endpointDeprecationWarning }) {
    const controller = index_1.metadata.controllers[object.constructor.name] || {};
    controller.endpoints = controller.endpoints || {};
    controller.endpoints[methodName] = controller.endpoints[methodName] || {};
    // The presence of versions signifies that this method might be unavailable for some versions and should
    // be skipped in final metadata processing step
    controller.endpoints[methodName].limitToVersions =
        controller.endpoints[methodName].limitToVersions || {};
    controller.endpoints[methodName].limitToVersions[version] =
        endpointDeprecationWarning || true;
    index_1.metadata.controllers[object.constructor.name] = controller;
} // Function decorators
function addVerbFunctionMeta({ verb, paths, object, methodName }) {
    const controller = index_1.metadata.controllers[object.constructor.name] || {};
    controller.endpoints = controller.endpoints || {};
    controller.endpoints[methodName] = controller.endpoints[methodName] || {};
    const argumentTypes = Reflect.getMetadata("design:paramtypes", object, methodName);
    controller.endpoints[methodName].arguments = controller.endpoints[methodName].arguments || {}; // this shouldn't exist but whatever
    argumentTypes === null || argumentTypes === void 0 ? void 0 : argumentTypes.forEach((argType, idx) => {
        controller.endpoints[methodName].arguments[idx] = controller.endpoints[methodName].arguments[idx] || {};
        controller.endpoints[methodName].arguments[idx].argType = argType;
    });
    controller.endpoints[methodName].verb = verb;
    controller.endpoints[methodName].paths = paths;
    const targetMethod = object[methodName];
    if (typeof targetMethod !== 'function') {
        throw new TypeError(`${methodName} must be a controller method`);
    }
    controller.endpoints[methodName].targetMethod = targetMethod;
    index_1.metadata.controllers[object.constructor.name] = controller;
} // argument injection decorators
function addArgumentInjectMeta({ index, ctxKey, ctxValueOptions, standardSchema, methodName, object }) {
    // console.log('argument', stackConfig, injectSource, injectOptions, object, methodName);
    const controller = index_1.metadata.controllers[object.constructor.name] || {};
    controller.endpoints = controller.endpoints || {};
    controller.endpoints[methodName] = controller.endpoints[methodName] || {};
    controller.endpoints[methodName].arguments =
        controller.endpoints[methodName].arguments || {};
    controller.endpoints[methodName].arguments[index] = {
        ctxKey,
        ctxValueOptions,
        standardSchema
    };
    index_1.metadata.controllers[object.constructor.name] = controller;
}
//# sourceMappingURL=common.js.map