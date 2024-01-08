export declare const unauthorizedFlow: () => Promise<never>;
/**
 * Test middleware that throws an unexpected error
 * @param ctx
 * @param next
 */
export declare const badFlow: (ctx: any, next: any) => Promise<void>;
export declare const setSomethingStateFlow: (ctx: any, next: any) => Promise<void>;
export declare const loginForTest: (ctx: any, next: any) => Promise<void>;
export declare const setSomethingSessionFlow: (ctx: any, next: any) => Promise<void>;
export declare const passFlow: (ctx: any, next: any) => Promise<void>;
