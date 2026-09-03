import { Request, Response } from 'koa';
import { Context } from '../../../index';
interface InterfaceInput {
    aString: string;
    aNumber: number;
}
type UploadedFile = Record<string, unknown> & {
    name?: unknown;
    type?: unknown;
};
declare class ClassInput {
    aString: string;
    aNumber: number;
}
declare class FileMetadataInput {
    size: number;
}
declare class NestedFileInput {
    metadata: FileMetadataInput;
}
export declare class ArgController {
    twoParams(params: Record<string, string>, id: string): Promise<{
        params: Record<string, string>;
        id: string;
    }>;
    bodyRequired(body: ClassInput): Promise<ClassInput>;
    simpleBody(body: unknown): Promise<unknown>;
    body(body: ClassInput): Promise<ClassInput>;
    bodyNested(body: NestedFileInput): Promise<NestedFileInput>;
    bodySpecific(foo: string): Promise<string>;
    bodyInterface(body: InterfaceInput): Promise<InterfaceInput>;
    state(state: Record<string, unknown>): Promise<Record<string, unknown>>;
    stateNoValue(foo: unknown): Promise<unknown>;
    user(user: Record<string, unknown>): Promise<Record<string, unknown>>;
    header(header: Record<string, string | string[] | undefined>): Promise<Record<string, string | string[]>>;
    query(q: Record<string, string | string[]>): Promise<Record<string, string | string[]>>;
    querySingle(q: string): Promise<string>;
    params(q: Record<string, string>): Promise<Record<string, string>>;
    paramsSingle(id: string): Promise<string>;
    paramsCastNumber(val: number): Promise<{
        type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
        val: number;
    }>;
    paramsCastBoolean(val: boolean): Promise<{
        type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
        val: boolean;
    }>;
    session(sess: Record<string, unknown>): Promise<Record<string, unknown>>;
    sessionSingle(sess: string): Promise<string>;
    req(req: Request): Promise<import("http").IncomingHttpHeaders>;
    uploadBuffer(ctx: Context, req: Request): Promise<unknown>;
    uploadFile(ctx: Context, files: Record<string, UploadedFile>): Promise<{
        testFile: {
            name: unknown;
            type: unknown;
        };
    }>;
    uploadFile2(ctx: Context, req: Request): Promise<{
        testFile: {
            name: unknown;
            type: unknown;
        };
    }>;
    res(res: Response): Promise<"works" | "did not work">;
    ctx(ctx: Context): Promise<Context>;
    ctx2(query: Record<string, string | string[]>): Promise<Record<string, string | string[]>>;
    custom(query: Record<string, string | string[]>): Promise<Record<string, string | string[]>>;
    multiPath(query: Record<string, string | string[]>): Promise<Record<string, string | string[]>>;
}
export {};
