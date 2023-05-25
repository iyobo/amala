import Boom from '@hapi/boom';

export const boom = require('@hapi/boom');

export type AmalaError = (message: string, data?: any) => any
// 400s
export const errorBadRequest: AmalaError = boom.badRequest;

export const errorNotLoggedIn: AmalaError = boom.unauthorized;

export const errorForbidden: AmalaError = boom.forbidden;

export const errorNotFound: AmalaError = boom.notFound;

export const errorBadInput: AmalaError = boom.badData;

// 500s
export const errorInternal: AmalaError = boom.internal;

export const errorDependencyFailed: AmalaError = boom.failedDependency;


export const errors = {
  badRequest: errorBadRequest,
  unauthorized: errorNotLoggedIn,
  forbidden: errorForbidden,
  notFound: errorNotFound,
  badInput: errorBadInput,
  dependencyFailed: errorDependencyFailed,
  internal: errorInternal
}