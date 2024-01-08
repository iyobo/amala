"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = void 0;
const common_1 = require("../common");
const tools_1 = require("../../util/tools");
function Get(path) {
    return function (object, methodName) {
        (0, common_1.addVerbFunctionMeta)({ verb: "get", methodName, paths: (0, tools_1.ensureArray)(path), object });
    };
}
exports.Get = Get;
//# sourceMappingURL=returns.js.map