export type KoaBodyOptions = {
    patchNode?: boolean;
    patchKoa?: boolean;
    jsonLimit?: string | number;
    formLimit?: string | number;
    textLimit?: string | number;
    encoding?: string;
    multipart?: boolean;
    urlencoded?: boolean;
    text?: boolean;
    json?: boolean;
    jsonStrict?: boolean;
    includeUnparsed?: boolean;
    formidable?: {
        maxFields?: number;
        maxFieldsSize?: number;
        uploadDir?: string;
        keepExtensions?: boolean;
        hash?: string;
        multiples?: boolean;
        onFileBegin?: (name: string, file: any) => void;
    };
    onError?: (error: any, context: any) => any;
    strict?: boolean;
    parsedMethods?: string[];
};
