import {
  addArgumentInjectMeta,
  resolveValidationDecoratorInput,
  ValidationDecoratorInput
} from '../../common';
import {ClassMethod} from '../../../types/metadata';
import {StandardSchemaV1} from '../../../types/standardSchema';

export interface ParamsDecorator {
  (schema: StandardSchemaV1): ParameterDecorator;
  (property: string, schema: StandardSchemaV1): ParameterDecorator;
  (injectOptions?: string | Record<string, unknown>): ParameterDecorator;
}

export const Params: ParamsDecorator = (
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
      ctxKey: "params",
      ctxValueOptions: injectOptions,
      standardSchema,
      methodName,
      object
    });
  };
};
