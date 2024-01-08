"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Params = void 0;
const common_1 = require("../../common");
function Params(injectOptions) {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "params",
            ctxValueOptions: injectOptions,
            methodName,
            object
        });
    };
}
exports.Params = Params;
//# sourceMappingURL=params.js.map