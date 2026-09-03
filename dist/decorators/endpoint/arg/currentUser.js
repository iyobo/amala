"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = CurrentUser;
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
//# sourceMappingURL=currentUser.js.map