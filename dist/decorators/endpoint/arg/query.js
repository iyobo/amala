"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const common_1 = require("../../common");
const Query = (input, propertySchema) => {
    const { injectOptions, standardSchema } = (0, common_1.resolveValidationDecoratorInput)(input, propertySchema);
    return function (object, methodName, index) {
        (0, common_1.addArgumentInjectMeta)({
            index,
            ctxKey: "query",
            ctxValueOptions: injectOptions,
            standardSchema,
            methodName,
            object
        });
    };
};
exports.Query = Query;
//# sourceMappingURL=query.js.map