"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Res = void 0;
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
exports.Res = Res;
//# sourceMappingURL=res.js.map