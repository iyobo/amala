/**
 * The Standard Schema V1 contract.
 *
 * This structural type intentionally mirrors the official specification so
 * Amala can accept compatible validators without a runtime dependency or a
 * library-specific adapter.
 *
 * @see https://standardschema.dev/schema
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}

// TypeScript declaration merging provides the familiar StandardSchemaV1.Result
// names used by the upstream specification.
// eslint-disable-next-line no-redeclare
export declare namespace StandardSchemaV1 {
  export interface Props<Input = unknown, Output = Input> {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown
    ) => Result<Output> | Promise<Result<Output>>;
    readonly types?: Types<Input, Output>;
  }

  export interface Types<Input = unknown, Output = Input> {
    readonly input: Input;
    readonly output: Output;
  }

  export type Result<Output> = SuccessResult<Output> | FailureResult;

  export interface SuccessResult<Output> {
    readonly value: Output;
    readonly issues?: undefined;
  }

  export interface FailureResult {
    readonly issues: ReadonlyArray<Issue>;
  }

  export interface Issue {
    readonly message: string;
    readonly path?: ReadonlyArray<PropertyKey | PathSegment>;
  }

  export interface PathSegment {
    readonly key: PropertyKey;
  }
}

/**
 * Optional Standard JSON Schema capability used by OpenAPI generation.
 * Validators that do not expose it still work at runtime; Amala simply omits
 * schema-derived OpenAPI details instead of inventing them.
 */
export interface StandardJSONSchemaV1<Input = unknown, Output = Input>
  extends StandardSchemaV1<Input, Output> {
  readonly "~standard": StandardSchemaV1.Props<Input, Output> & {
    readonly jsonSchema: StandardJSONSchemaV1.Converter;
  };
}

// eslint-disable-next-line no-redeclare
export declare namespace StandardJSONSchemaV1 {
  export interface Converter {
    readonly input: (options: Options) => Record<string, unknown>;
    readonly output: (options: Options) => Record<string, unknown>;
  }

  export interface Options {
    readonly target:
      | "openapi-3.0"
      | "draft-07"
      | "draft-2020-12"
      | (string & {});
    readonly libraryOptions?: Record<string, unknown>;
  }
}
