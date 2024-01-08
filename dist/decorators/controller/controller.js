"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const index_1 = require("../../index");
const tools_1 = require("../../util/tools");
function Controller(baseRoute) {
    return function (classDefinition) {
        // It is possible to define multiple routes to use the same controller
        const routes = (0, tools_1.ensureArray)(baseRoute);
        let controller = index_1.metadata.controllers[classDefinition.name];
        if (controller) {
            // honestly, this should never be the case. It is not expected that a controller pre-exists...unless there was a dual scan
            controller.paths = routes;
            controller.targetClass = classDefinition;
        }
        else {
            controller = {
                paths: routes,
                targetClass: classDefinition,
                endpoints: {}
            };
        }
        index_1.metadata.controllers[classDefinition.name] = controller;
        if (index_1.options === null || index_1.options === void 0 ? void 0 : index_1.options.diagnostics) {
            console.info(`Amala: Registering controller ${classDefinition.name} at "${index_1.options.basePath}${index_1.options.disableVersioning ? '' : '/v...'}${routes}"`);
        }
    };
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map