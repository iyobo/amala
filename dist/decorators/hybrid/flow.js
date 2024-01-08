"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flow = void 0;
const common_1 = require("../common");
const index_1 = require("../../index");
const tools_1 = require("../../util/tools");
/**
 * Flow is an array of middleware you want to run prior to the controller endpoint.
 * This is where you implement constraints like authentication, authorization and similar pre-checks.
 * @param flow - A middleware or array of middleware
 * @constructor
 */
function Flow(flow) {
    return function (object, methodName) {
        if (typeof object === "object") {
            // endpoint
            (0, common_1.addFlowFunctionMeta)({ flow: (0, tools_1.ensureArray)(flow), methodName, object });
        }
        else if (typeof object === "function") {
            // controller
            const controller = index_1.metadata.controllers[object.name] || {};
            controller.flow = (0, tools_1.ensureArray)(flow);
            index_1.metadata.controllers[object.name] = controller;
        }
    };
}
exports.Flow = Flow;
//# sourceMappingURL=flow.js.map