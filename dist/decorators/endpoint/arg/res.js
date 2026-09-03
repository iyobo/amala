"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Res = Res;
const common_1 = require("../../common");
function Res(injectOptions) {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "res",
            ctxValueOptions: injectOptions,
            methodName,
            object
        });
    };
}
//# sourceMappingURL=res.js.map