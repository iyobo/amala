"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const common_1 = require("../../common");
function Query(injectOptions) {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "query",
            ctxValueOptions: injectOptions,
            methodName,
            object
        });
    };
}
exports.Query = Query;
//# sourceMappingURL=query.js.map