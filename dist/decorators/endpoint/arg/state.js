"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
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
exports.State = State;
//# sourceMappingURL=state.js.map