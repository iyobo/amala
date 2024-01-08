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
    staten(state: any): Promise<any>;
    usedByThis(p: any): Promise<any>;
    usedByThis2(p: any): Promise<{
        res: any;
    }>;
    usingThis(): Promise<any>;
    usingThis2(): Promise<{
        res: any;
    }>;
}
