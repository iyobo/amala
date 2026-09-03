"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Req = Req;
const common_1 = require("../../common");
function Req(injectOptions) {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "request",
            ctxValueOptions: injectOptions,
            methodName,
            object
        });
    };
}
//# sourceMappingURL=req.js.map