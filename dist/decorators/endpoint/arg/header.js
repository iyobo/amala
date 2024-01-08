"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const common_1 = require("../../common");
function Header(injectOptions) {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "header",
            ctxValueOptions: injectOptions,
            methodName,
            object
        });
    };
}
exports.Header = Header;
//# sourceMappingURL=header.js.map