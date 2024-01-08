"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateMetaField = exports.getPropertiesOfClassValidator = exports.ensureArray = exports.isValidatableClass = exports.isClass = void 0;
const class_validator_1 = require("class-validator");
function isClass(type) {
    var _a, _b, _c;
    return ((_a = type === null || type === void 0 ? void 0 : type.prototype) === null || _a === void 0 ? void 0 : _a.constructor) && ((_c = (_b = type === null || type === void 0 ? void 0 : type.prototype) === null || _b === void 0 ? void 0 : _b.constructor) === null || _c === void 0 ? void 0 : _c.name) !== "Object";
}
exports.isClass = isClass;
function isValidatableClass(type) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return ((_a = type === null || type === void 0 ? void 0 : type.prototype) === null || _a === void 0 ? void 0 : _a.constructor)
        && ((_c = (_b = type === null || type === void 0 ? void 0 : type.prototype) === null || _b === void 0 ? void 0 : _b.constructor) === null || _c === void 0 ? void 0 : _c.name) !== "Object"
        && ((_e = (_d = type === null || type === void 0 ? void 0 : type.prototype) === null || _d === void 0 ? void 0 : _d.constructor) === null || _e === void 0 ? void 0 : _e.name) !== "Number"
        && ((_g = (_f = type === null || type === void 0 ? void 0 : type.prototype) === null || _f === void 0 ? void 0 : _f.constructor) === null || _g === void 0 ? void 0 : _g.name) !== "String"
        && ((_j = (_h = type === null || type === void 0 ? void 0 : type.prototype) === null || _h === void 0 ? void 0 : _h.constructor) === null || _j === void 0 ? void 0 : _j.name) !== "Boolean";
}
exports.isValidatableClass = isValidatableClass;
function ensureArray(item) {
    if (!item)
        return [];
    return Array.isArray(item) ? item : [item];
}
exports.ensureArray = ensureArray;
function getPropertiesOfClassValidator(targetConstructor) {
    try {
        const metadataStorage = (0, class_validator_1.getMetadataStorage)();
        const targetMetadatas = metadataStorage
            .getTargetValidationMetadatas(targetConstructor, undefined, false, false, undefined);
        const groupedMetadatas = metadataStorage.groupByPropertyName(targetMetadatas);
        return Object.fromEntries(Object.entries(groupedMetadatas).map(([property, decorators]) => {
            const CM = decorators.map(decorator => metadataStorage.getTargetValidatorConstraints(decorator.constraintCls).map(v => v.name));
            return [property, CM.flat()];
        }));
    }
    catch (e) {
        e.message += '. This typically happens when you build your TS code with a compiler like EsBuild that does not respect the "emitDecorators:true" configuration. Please recompile your amala project with tsc or a derivative/combination that involves tsc';
        throw e;
    }
}
exports.getPropertiesOfClassValidator = getPropertiesOfClassValidator;
const cvCodex = {
    "isString": "string",
    "isNumber": "number",
    "isBoolean": "boolean"
};
function translateMetaField(metaField) {
    const result = {
        type: "string",
        required: false
    };
    metaField.forEach(it => {
        result.type = cvCodex[it] || result.type;
        result.required = result.required || it.includes('Required');
    });
    return result;
}
exports.translateMetaField = translateMetaField;
//# sourceMappingURL=tools.js.map