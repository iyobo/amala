/// <reference types="node" />
/// <reference types="formidable" />
import { Request, Response } from 'koa';
interface InterfaceInput {
    aString: string;
    aNumber: number;
}
declare class ClassInput {
    aString: string;
    aNumber: number;
}
export declare class ArgController {
    twoParams(params: any, id: string): Promise<{
        params: any;
        id: string;
    }>;
    bodyRequired(body: ClassInput): Promise<ClassInput>;
    simpleBody(body: any): Promise<any>;
    body(body: ClassInput): Promise<ClassInput>;
    bodySpecific(foo: string): Promise<string>;
    bodyInterface(body: InterfaceInput): Promise<InterfaceInput>;
    state(state: any): Promise<any>;
    stateNoValue(foo: any): Promise<any>;
    user(user: any): Promise<any>;
    header(header: any): Promise<any>;
    query(q: any): Promise<any>;
    querySingle(q: string): Promise<string>;
    params(q: any): Promise<any>;
    paramsSingle(id: string): Promise<string>;
    paramsCastNumber(val: number): Promise<{
        type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
        val: number;
    }>;
    paramsCastBoolean(val: boolean): Promise<{
        type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
        val: boolean;
    }>;
    session(sess: any): Promise<any>;
    sessionSingle(sess: string): Promise<string>;
    req(req: Request): Promise<import("http").IncomingHttpHeaders>;
    uploadBuffer(ctx: any, req: Request): Promise<any>;
    uploadFile(ctx: any, files: Record<string, File>): Promise<Record<string, File>>;
    uploadFile2(ctx: any, req: Request): Promise<import("formidable").Files>;
    res(res: Response): Promise<"works" | "did not work">;
    ctx(ctx: any): Promise<any>;
    ctx2(query: any): Promise<any>;
    custom(query: any): Promise<any>;
    multiPath(query: any): Promise<any>;
}
export {};
