"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const common_1 = require("../../common");
const Body = (input, propertySchema) => {
    const { injectOptions, standardSchema } = (0, common_1.resolveValidationDecoratorInput)(input, propertySchema);
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "body",
            ctxValueOptions: injectOptions,
            standardSchema,
            methodName,
            object
        });
    };
};
exports.Body = Body;
//# sourceMappingURL=body.js.map