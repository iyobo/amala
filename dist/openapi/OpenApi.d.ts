import { OpenAPIV3_1 } from "openapi-types";
import { AmalaOptions } from "../types/AmalaOptions";
import { AmalaMetadata } from "../types/metadata";
import { EmptyContext } from '../types/context';
export declare let openApiSpec: OpenAPIV3_1.Document;
export declare function generateOpenApi<StateT extends object = EmptyContext, ContextT extends object = EmptyContext>(metaData: AmalaMetadata, options: AmalaOptions<StateT, ContextT>): void;
