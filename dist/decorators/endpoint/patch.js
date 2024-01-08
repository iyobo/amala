"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Patch = void 0;
const common_1 = require("../common");
const tools_1 = require("../../util/tools");
function Patch(path) {
    return function (object, methodName) {
        (0, common_1.addVerbFunctionMeta)({ verb: "patch", methodName, paths: (0, tools_1.ensureArray)(path), object });
    };
}
exports.Patch = Patch;
//# sourceMappingURL=patch.js.map