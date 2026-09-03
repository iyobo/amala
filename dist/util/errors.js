"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.errorDependencyFailed = exports.errorInternal = exports.errorBadInput = exports.errorNotFound = exports.errorForbidden = exports.errorNotLoggedIn = exports.errorBadRequest = exports.boom = void 0;
const Boom = __importStar(require("@hapi/boom"));
exports.boom = Boom;
// 400s
exports.errorBadRequest = exports.boom.badRequest;
exports.errorNotLoggedIn = exports.boom.unauthorized;
exports.errorForbidden = exports.boom.forbidden;
exports.errorNotFound = exports.boom.notFound;
exports.errorBadInput = exports.boom.badData;
// 500s
exports.errorInternal = exports.boom.internal;
exports.errorDependencyFailed = exports.boom.failedDependency;
exports.errors = {
    badRequest: exports.errorBadRequest,
    unauthorized: exports.errorNotLoggedIn,
    forbidden: exports.errorForbidden,
    notFound: exports.errorNotFound,
    badInput: exports.errorBadInput,
    dependencyFailed: exports.errorDependencyFailed,
    internal: exports.errorInternal
};
//# sourceMappingURL=errors.js.map