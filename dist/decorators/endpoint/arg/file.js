"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const common_1 = require("../../common");
function File() {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "request",
            ctxValueOptions: "files",
            methodName,
            object
        });
    };
}
exports.File = File;
//# sourceMappingURL=file.js.map