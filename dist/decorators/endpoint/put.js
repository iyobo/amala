"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Put = Put;
const common_1 = require("../common");
const tools_1 = require("../../util/tools");
function Put(path) {
    return function (object, methodName) {
        (0, common_1.addVerbFunctionMeta)({ verb: "put", methodName, paths: (0, tools_1.ensureArray)(path), object });
    };
}
//# sourceMappingURL=put.js.map