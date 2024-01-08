"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("../../common");
function CurrentUser(injectOptions) {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "currentUser",
            ctxValueOptions: injectOptions,
            methodName,
            object
        });
    };
}
exports.CurrentUser = CurrentUser;
//# sourceMappingURL=currentUser.js.map