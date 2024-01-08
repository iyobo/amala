"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = void 0;
const common_1 = require("../common");
const tools_1 = require("../../util/tools");
function Delete(path) {
    return function (object, methodName) {
        (0, common_1.addVerbFunctionMeta)({ verb: "delete", methodName, paths: (0, tools_1.ensureArray)(path), object });
    };
}
exports.Delete = Delete;
//# sourceMappingURL=delete.js.map