export declare class EndpointController {
    getRoute(): Promise<string>;
    postRoute(): Promise<string>;
    patchRoute(): Promise<string>;
    putRoute(): Promise<string>;
    deleteRoute(): Promise<string>;
    mmmV1(): Promise<string>;
    mmm(): Promise<string>;
    passFlow(): Promise<string>;
    unauthorized(): Promise<string>;
    badFlow(): Promise<string>;
    multiFlow(): Promise<string>;
    staten(state: Record<string, unknown>): Promise<Record<string, unknown>>;
    usedByThis(p: unknown): Promise<unknown>;
    usedByThis2(p: unknown): Promise<{
        res: unknown;
    }>;
    usingThis(): Promise<unknown>;
    usingThis2(): Promise<{
        res: unknown;
    }>;
}
