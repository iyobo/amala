import * as Boom from '@hapi/boom';
export declare const boom: typeof Boom;
export type AmalaError = (message: string, data?: unknown) => Error;
export declare const errorBadRequest: AmalaError;
export declare const errorNotLoggedIn: AmalaError;
export declare const errorForbidden: AmalaError;
export declare const errorNotFound: AmalaError;
export declare const errorBadInput: AmalaError;
export declare const errorInternal: AmalaError;
export declare const errorDependencyFailed: AmalaError;
export declare const errors: {
    badRequest: AmalaError;
    unauthorized: AmalaError;
    forbidden: AmalaError;
    notFound: AmalaError;
    badInput: AmalaError;
    dependencyFailed: AmalaError;
    internal: AmalaError;
};
