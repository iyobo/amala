"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addArgumentInjectMeta = exports.addVerbFunctionMeta = exports.addVersionFunctionMeta = exports.addFlowFunctionMeta = void 0;
require("reflect-metadata");
const index_1 = require("../index");
function addFlowFunctionMeta({ flow, methodName, object }) {
    const controller = index_1.metadata.controllers[object.constructor.name] || {};
    controller.endpoints = controller.endpoints || {};
    controller.endpoints[methodName] = controller.endpoints[methodName] || {};
    controller.endpoints[methodName].flow = controller.endpoints[methodName].flow || [];
    controller.endpoints[methodName].flow = [...controller.endpoints[methodName].flow, ...flow];
    index_1.metadata.controllers[object.constructor.name] = controller;
}
exports.addFlowFunctionMeta = addFlowFunctionMeta;
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
exports.addVersionFunctionMeta = addVersionFunctionMeta;
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
    controller.endpoints[methodName].targetMethod = object[methodName];
    index_1.metadata.controllers[object.constructor.name] = controller;
} // argument injection decorators
exports.addVerbFunctionMeta = addVerbFunctionMeta;
function addArgumentInjectMeta({ index, ctxKey, ctxValueOptions, methodName, object }) {
    // console.log('argument', stackConfig, injectSource, injectOptions, object, methodName);
    const controller = index_1.metadata.controllers[object.constructor.name] || {};
    controller.endpoints = controller.endpoints || {};
    controller.endpoints[methodName] = controller.endpoints[methodName] || {};
    controller.endpoints[methodName].arguments =
        controller.endpoints[methodName].arguments || {};
    controller.endpoints[methodName].arguments[index] = {
        ctxKey: ctxKey,
        ctxValueOptions: ctxValueOptions
    };
    index_1.metadata.controllers[object.constructor.name] = controller;
}
exports.addArgumentInjectMeta = addArgumentInjectMeta;
//# sourceMappingURL=common.js.map