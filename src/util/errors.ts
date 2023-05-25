export const boom = require('@hapi/boom');


// 400s
export const errorBadRequest = boom.badRequest;

export const errorNotLoggedIn = boom.unauthorized;

export const errorForbidden = boom.forbidden;

export const errorNotFound = boom.notFound;

export const errorBadInput = boom.badData;

// 500s
export const errorInternal = boom.internal;

export const errorDependencyFailed = boom.failedDependency;


