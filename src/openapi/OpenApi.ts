import { OpenAPIV3_1 } from "openapi-types";
import * as _ from "lodash";
import { AmalaOptions } from "../types/AmalaOptions";
import { AmalaMetadata } from "../types/metadata";
import { translateMetaField, getPropertiesOfClassValidator } from "../util/tools";
import {EmptyContext} from '../types/context';

type SimpleSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'object';

function toSimpleSchemaType(value?: string): SimpleSchemaType {
  const normalized = value?.toLowerCase();
  if (
    normalized === 'number'
    || normalized === 'integer'
    || normalized === 'boolean'
    || normalized === 'object'
  ) {
    return normalized;
  }
  return 'string';
}


function createDefaultOpenApiSpec(): OpenAPIV3_1.Document {
  return {
    openapi: "3.0.1",
    info: {
      title: "API",
      description: "powered by AmalaJS (https://github.com/iyobo/amala)",
      version: "1.0.0"
    },
    servers: [],
    paths: {},
    components: {
      schemas: {}
    },
    security: [],
    tags: [],
    externalDocs: undefined
  };
}

export let openApiSpec: OpenAPIV3_1.Document = createDefaultOpenApiSpec();

export function generateOpenApi<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext
>(metaData: AmalaMetadata, options: AmalaOptions<StateT, ContextT>) {

  // incorporate custom spec values
  const customSpec = options.openAPI?.spec || {};
  openApiSpec = _.merge(createDefaultOpenApiSpec(), customSpec);

  // overwrite default info with developer's API info. handled by deep merge
  // openApiSpec.info = {...openApiSpec.info, ...options.openAPI.spec.info};

  const meta = { ...metaData };

  // used to build up the paths section of the openAPI spec
  const paths: OpenAPIV3_1.PathsObject = {};

  const schemas: Record<string, OpenAPIV3_1.SchemaObject> = {
    Object: {
      type: "object",
      properties: {}
    }
  };

  // ---- SERVERS
  const servers: OpenAPIV3_1.ServerObject[] = [];

  if (!options.disableVersioning) {
    if (Array.isArray(options.versions)) {
      options.versions.forEach(it => {
        servers.push({
          url: joinServerUrl(options.openAPI.publicURL, options.basePath, `v${it}`),
          description: `version ${it}`
        });
      });
    } else {
      for (const [k, v] of Object.entries(options.versions)) {
        if (v) {
          servers.push({
            url: joinServerUrl(options.openAPI.publicURL, options.basePath, `v${k}`),
            description: `version ${k}`
          });
        }
      }
    }
  } else {
    servers.push({
      url: joinServerUrl(options.openAPI.publicURL, options.basePath)
    });
  }
  openApiSpec.servers = [...servers, ...(customSpec.servers || [])];

  /**
   * logs encountered SCHEMAS
   */
  function registerSchema(obj?: Function): void {

    // e.g
    // "Category": {
    //   "type": "object",
    //   "properties": {
    //     "id": {
    //       "type": "integer",
    //       "format": "int64"
    //     },
    //     "name": {
    //       "type": "string"
    //     }
    //   }
    // }

    if (!obj) return;
    const meta = getPropertiesOfClassValidator(obj);

    if (Object.keys(meta).length > 0) {
      // this is a class-validator class

      const properties: Record<string, {type: SimpleSchemaType}> = {};
      const required: string[] = [];

      // loop through prototype props
      for (const fieldName in meta) {
        const tr = translateMetaField(meta[fieldName]);
        properties[fieldName] = {
          type: toSimpleSchemaType(tr.type)
        };
        if (tr.required) required.push(fieldName);
      }

      schemas[obj.name] = {
        type: "object",
        required,
        properties
      };
    }

  }

  /***
   * generate PATHs
   */
  for (const controllerClassName in meta.controllers) {
    // e.g UserController
    const controller = meta.controllers[controllerClassName];

    controller.paths.forEach(controllerPath => {

      const controllerBasePath = convertRegexpToSwagger(controllerPath);

      // for each endpoint
      for (const endpointName in controller.endpoints) {

        const endpoint = controller.endpoints[endpointName];

        // for each path
        endpoint.paths.forEach(endpointPath => {

          // PROCESS ENDPOINT
          const fullPath = joinRoutePath(
            controllerBasePath,
            convertRegexpToSwagger(endpointPath === "/" ? "" : endpointPath)
          );
          const verb = endpoint.verb;

          paths[fullPath] = paths[fullPath] || {};

          const parameters: OpenAPIV3_1.ParameterObject[] = [
            // {
            //   "in": "path",
            //   "name": "userId",
            //   "required": true,
            //   "schema": {
            //     "type": "string"
            //   }
            // }
          ];

          const requestBodyProperties: Record<string, {type: SimpleSchemaType}> = {};
          const requestBodyRequired: string[] = [];


          /**
           *  For each argument, divide it between requestBody (source:body) or parameters (any other source).
           *  extract fields from classvalidators into its own function.
           *  TODO: make it a nested thing.
           * */
          for (const argId in endpoint.arguments) {
            const argumentMeta = endpoint.arguments[argId];

            const ctxKey = argumentMeta.ctxKey;

            // We only care about arguments with @Body, @Query or @Params decorators
            if (!isDocumentedSource(ctxKey)) continue;

            // register schema if applicable
            registerSchema(argumentMeta.argType);

            // const ctxValueOptions = argumentMeta.ctxValueOptions;
            // const valueOptionsType = typeof argumentMeta.ctxValueOptions;
            let required = false;

            const oasSource = deriveOasSource(ctxKey);

            if (argumentMeta.ctxValueOptions && typeof argumentMeta.ctxValueOptions !== "string") {
              // injection object
              required = Boolean(
                (argumentMeta.ctxValueOptions as {required?: boolean}).required
              );
            }

            // if the argument exists as part of path, consider to be required
            if (oasSource === "path") {
              required = true;
            }

            // build parameters
            const meta = getPropertiesOfClassValidator(argumentMeta.argType);
            const metaEntries = Object.entries(meta);
            if (metaEntries.length > 0) {

              metaEntries.forEach(it => {
                const tr = translateMetaField(it[1]);

                if (oasSource === "body") {
                  requestBodyProperties[it[0]] = {
                    type: toSimpleSchemaType(tr.type)
                  };
                  if (tr.required) requestBodyRequired.push(it[0]);
                } else {
                  parameters.push({
                    name: it[0],
                    in: oasSource,
                    required: oasSource !== "path"? tr.required: undefined,
                    schema: {
                      // @ts-ignore
                      type: tr.type || "string"
                    }
                  });
                }

              });

            } else {

              if (oasSource === "body") {
                const propertyName = String(argumentMeta.ctxValueOptions);
                requestBodyProperties[propertyName] = {
                  type: toSimpleSchemaType(argumentMeta.argType?.name || "object"),
                };
                if (required) requestBodyRequired.push(propertyName);
              } else{
                parameters.push({
                  name: String(argumentMeta.ctxValueOptions),
                  in: oasSource,
                  required: oasSource !== "path"? required: undefined,
                  schema: {
                    type: toSimpleSchemaType(argumentMeta.argType?.name || "object")
                  }
                });
              }
            }


          }

          const requestBody: OpenAPIV3_1.RequestBodyObject = {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: requestBodyProperties,
                  required: requestBodyRequired.length ? requestBodyRequired : undefined
                }
              },
              "application/x-www-form-urlencoded": {
                schema: {
                  type: "object",
                  properties: requestBodyProperties,
                  required: requestBodyRequired.length ? requestBodyRequired : undefined
                }
              },
            }
          };

          // Finalize path
          paths[fullPath][verb] = {
            operationId: `${controllerClassName}.${endpointName}`,
            summary: endpointName,
            tags: [
              controllerClassName
            ],
            // @ts-ignore
            requestBody: Object.keys(requestBodyProperties).length > 0 ? requestBody : undefined,
            parameters,
            responses: {
              "2xx": { // TODO: more details
                description: "Successful response",
                headers: {},
                content: {
                  "application/json": {
                    schema: {
                      // TODO: Implement @Return decorator
                      $ref: `#/components/schemas/Object`
                    }
                  }
                }
              }
            }
          };


        });

      }
    });
  }

  openApiSpec.paths = _.merge({}, customSpec.paths || {}, paths);
  openApiSpec.components = openApiSpec.components || {};
  openApiSpec.components.schemas = {
    ...(openApiSpec.components.schemas || {}),
    ...schemas
  };
  // @ts-ignore
  // openApiSpec.components.requestBodies = schemas;
  // console.log('OpenApi.init', meta);
}

function joinRoutePath(...segments: string[]): string {
  const path = segments
    .join('/')
    .split('/')
    .filter(Boolean)
    .join('/');

  return path ? `/${path}` : '/';
}

function joinServerUrl(publicURL = '', ...segments: string[]): string {
  const origin = publicURL.replace(/\/+$/, '');
  const path = joinRoutePath(...segments);

  if (path === '/') return origin || '/';
  return `${origin}${path}`;
}

function convertRegexpToSwagger(path: string | RegExp): string {
  const swaggerPath = [];

  let paramMode = false;
  for (const c of String(path)) {

    if (c === ":") {
      paramMode = true;
      swaggerPath.push("{");
    } else if (paramMode && c === "/") {
      paramMode = false;
      swaggerPath.push("}/");
    } else {
      swaggerPath.push(c);
    }
  }

  if (paramMode) swaggerPath.push("}");

  return swaggerPath.join("");
}


type DocumentedSource = 'body' | 'query' | 'params';

function isDocumentedSource(source: unknown): source is DocumentedSource {
  return source === 'body' || source === 'query' || source === 'params';
}

function deriveOasSource(source: DocumentedSource): 'body' | 'path' | 'query' {
  switch (source) {
    case "params": {
      return "path";
    }
    default: {
      return source;
    }
  }
}
