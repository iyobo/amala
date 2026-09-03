"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = State;
const common_1 = require("../../common");
function State(injectOptions) {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "state",
            ctxValueOptions: injectOptions,
            methodName,
            object
        });
    };
}
//# sourceMappingURL=state.js.map