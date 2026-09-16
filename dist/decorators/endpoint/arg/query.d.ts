import { ValidationDecoratorOptions } from '../../common';
import { StandardSchemaV1 } from '../../../types/standardSchema';
export interface QueryDecorator {
    (schema: StandardSchemaV1): ParameterDecorator;
    (property: string, schema: StandardSchemaV1): ParameterDecorator;
    (injectOptions?: string | ValidationDecoratorOptions): ParameterDecorator;
}
export declare const Query: QueryDecorator;
