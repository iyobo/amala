"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = Version;
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
//# sourceMappingURL=version.js.map