export declare class ProtectedController {
    hello(): Promise<string>;
    postRoute(): Promise<string>;
    patchRoute(): Promise<string>;
    putRoute(): Promise<string>;
    deleteRoute(): Promise<string>;
    someRoute(): Promise<string>;
    v1OnlyRoute(): Promise<string>;
    passFlow(): Promise<string>;
    unauthorized(): Promise<string>;
    multiFlow(): Promise<string>;
}
