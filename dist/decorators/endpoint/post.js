"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const common_1 = require("../common");
const tools_1 = require("../../util/tools");
function Post(path) {
    return function (object, methodName) {
        (0, common_1.addVerbFunctionMeta)({ verb: "post", methodName, paths: (0, tools_1.ensureArray)(path), object });
    };
}
exports.Post = Post;
//# sourceMappingURL=post.js.map