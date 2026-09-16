import { StandardSchemaV1 } from '../../../types/standardSchema';
export interface ParamsDecorator {
    (schema: StandardSchemaV1): ParameterDecorator;
    (property: string, schema: StandardSchemaV1): ParameterDecorator;
    (injectOptions?: string | Record<string, unknown>): ParameterDecorator;
}
export declare const Params: ParamsDecorator;
