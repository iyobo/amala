"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = Query;
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
//# sourceMappingURL=query.js.map