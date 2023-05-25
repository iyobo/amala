export const boom = require('@hapi/boom');


// 400s
export const errorBadRequest: typeof boom.badRequest = boom.badRequest;

export const errorNotLoggedIn: typeof boom.unauthorized = boom.unauthorized;

export const errorForbidden: typeof boom.forbidden = boom.forbidden;

export const errorNotFound: typeof boom.notFound = boom.notFound;

export const errorBadInput: typeof boom.badData = boom.badData;

// 500s
export const errorInternal: typeof boom.internal = boom.internal;

export const errorDependencyFailed: typeof boom.failedDependency = boom.failedDependency;


