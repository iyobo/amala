import { OpenAPIV3_1 } from "openapi-types";
import { AmalaOptions } from "../types/AmalaOptions";
import { AmalaMetadata } from "../types/metadata";
export declare let openApiSpec: OpenAPIV3_1.Document;
export declare function generateOpenApi(metaData: AmalaMetadata, options: AmalaOptions): void;
