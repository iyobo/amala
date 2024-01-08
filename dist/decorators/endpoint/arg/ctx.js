"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctx = void 0;
const common_1 = require("../../common");
/**
 * Injects the full Koa context.
 * @param injectOptions
 * @constructor
 */
function Ctx(ctxfield, injectOptions) {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: ctxfield || "ctx",
            ctxValueOptions: injectOptions,
            methodName,
            object
        });
    };
}
exports.Ctx = Ctx;
//# sourceMappingURL=ctx.js.map