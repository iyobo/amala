"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Put = void 0;
const common_1 = require("../common");
const tools_1 = require("../../util/tools");
function Put(path) {
    return function (object, methodName) {
        (0, common_1.addVerbFunctionMeta)({ verb: "put", methodName, paths: (0, tools_1.ensureArray)(path), object });
    };
}
exports.Put = Put;
//# sourceMappingURL=put.js.map