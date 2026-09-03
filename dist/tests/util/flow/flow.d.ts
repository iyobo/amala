import type { AmalaMiddleware } from '../../../index';
type TestState = {
    something?: string;
    user?: {
        id: string;
        firstname: string;
        lastName: string;
    };
};
type SessionContext = {
    session?: Record<string, string>;
};
export declare const unauthorizedFlow: () => Promise<never>;
/**
 * Test middleware that throws an unexpected error
 * @param ctx
 * @param next
 */
export declare const badFlow: AmalaMiddleware;
export declare const setSomethingStateFlow: AmalaMiddleware<TestState>;
export declare const loginForTest: AmalaMiddleware<TestState>;
export declare const setSomethingSessionFlow: AmalaMiddleware<{}, SessionContext>;
export declare const passFlow: AmalaMiddleware;
export {};
