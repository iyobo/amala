"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = void 0;
const common_1 = require("../common");
function Version(version, endpointDeprecationWarning) {
    return function (object, methodName) {
        (0, common_1.addVersionFunctionMeta)({
            object,
            methodName,
            version,
            endpointDeprecationWarning
        });
    };
}
exports.Version = Version;
//# sourceMappingURL=version.js.map