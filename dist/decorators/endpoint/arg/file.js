"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const common_1 = require("../../common");
function File() {
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "request",
            // koa-body exposes `files`; @koa/multer exposes `file` for single uploads.
            // The request argument translator supports both while preserving this
            // metadata shape for existing consumers of getControllers().
            ctxValueOptions: "files",
            methodName,
            object
        });
    };
}
exports.File = File;
//# sourceMappingURL=file.js.map