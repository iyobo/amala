"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = Session;
const common_1 = require("../../common");
function Session(injectOptions) {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "session",
            ctxValueOptions: injectOptions,
            methodName,
            object
        });
    };
}
//# sourceMappingURL=session.js.map