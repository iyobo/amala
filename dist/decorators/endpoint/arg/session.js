"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
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
exports.Session = Session;
//# sourceMappingURL=session.js.map