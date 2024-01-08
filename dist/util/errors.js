"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.errorDependencyFailed = exports.errorInternal = exports.errorBadInput = exports.errorNotFound = exports.errorForbidden = exports.errorNotLoggedIn = exports.errorBadRequest = exports.boom = void 0;
exports.boom = require('@hapi/boom');
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