import {
  addArgumentInjectMeta,
  resolveValidationDecoratorInput,
  ValidationDecoratorInput,
  ValidationDecoratorOptions
} from '../../common';
import {ClassMethod} from '../../../types/metadata';
import {StandardSchemaV1} from '../../../types/standardSchema';

export interface QueryDecorator {
  (schema: StandardSchemaV1): ParameterDecorator;
  (property: string, schema: StandardSchemaV1): ParameterDecorator;
  (injectOptions?: string | ValidationDecoratorOptions): ParameterDecorator;
}

export const Query: QueryDecorator = (
  input?: ValidationDecoratorInput,
  propertySchema?: StandardSchemaV1
) => {
  const {injectOptions, standardSchema} = resolveValidationDecoratorInput(
    input,
    propertySchema
  );
  return function (
    object: ClassMethod,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "query",
      ctxValueOptions: injectOptions,
      standardSchema,
      methodName,
      object
    });
  };
};
