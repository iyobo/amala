import { OpenAPIV3_1 } from "openapi-types";
import * as _ from "lodash";
import { AmalaOptions } from "../types/AmalaOptions";
import { AmalaMetadata } from "../types/metadata";
import { translateMetaField, getPropertiesOfClassValidator } from "../util/tools";


export let openApiSpec: OpenAPIV3_1.Document = {
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

export function generateOpenApi(metaData: AmalaMetadata, options: AmalaOptions) {

  // incorporate custom spec values
  openApiSpec = _.merge(openApiSpec, options.openAPI.spec);

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
  const rootPath = options.openAPI.publicURL + options.basePath;

  if (!options.disableVersioning) {
    if (Array.isArray(options.versions)) {
      options.versions.forEach(it => {
        servers.push({
          url: rootPath + "/v" + it,
          description: `version ${it}`
        });
      });
    } else {
      for (const [k, v] of Object.entries(options.versions)) {
        if (v) {
          servers.push({
            url: rootPath + "/v" + k,
            description: `version ${k}`
          });
        }
      }
    }
  } else {
    servers.push({
      url: options.openAPI.publicURL
    });
  }
  openApiSpec.servers = [...servers, ...(options.openAPI?.spec?.servers || [])];

  /**
   * logs encountered SCHEMAS
   */
  function registerSchema(obj) {

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

      const properties = {};
      const required = [];

      // loop through prototype props
      for (const fieldName in meta) {
        const tr = translateMetaField(meta[fieldName]);
        properties[fieldName] = {
          type: tr.type
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

      const basePath = options.basePath + convertRegexpToSwagger(controllerPath);

      // for each endpoint
      for (const endpointName in controller.endpoints) {

        const endpoint = controller.endpoints[endpointName];

        // for each path
        endpoint.paths.forEach(endpointPath => {

          // PROCESS ENDPOINT
          const fullPath = basePath + convertRegexpToSwagger((endpointPath === "/" ? "" : endpointPath));
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

          const requestBodyProperties = {};


          /**
           *  For each argument, divide it between requestBody (source:body) or parameters (any other source).
           *  extract fields from classvalidators into its own function.
           *  TODO: make it a nested thing.
           * */
          for (const argId in endpoint.arguments) {
            const argumentMeta = endpoint.arguments[argId];

            const ctxKey = argumentMeta.ctxKey;

            // We only care about arguments with @Body, @Query or @Params decorators
            if (!["body", "query", "params"].includes(ctxKey)) continue;

            // register schema if applicable
            registerSchema(argumentMeta.argType);

            // const ctxValueOptions = argumentMeta.ctxValueOptions;
            // const valueOptionsType = typeof argumentMeta.ctxValueOptions;
            let required = false;

            const oasSource: "body" | "path" | "query" = deriveOasSoure(argumentMeta.ctxKey);

            if (argumentMeta.ctxValueOptions && typeof argumentMeta.ctxValueOptions !== "string") {
              // injection object
              required = argumentMeta.ctxValueOptions.required || false;
            }

            // if the argument exists as part of path, consider to be required
            if (oasSource === "path") {
              required = true;
            }

            // build parameters
            const meta = getPropertiesOfClassValidator(argumentMeta.argType);
            const metaEntries = Object.entries(meta);
            if (metaEntries.length > 0) {

              metaEntries.forEach((it, idx) => {
                const tr = translateMetaField(it[1]);

                if (oasSource === "body") {
                  requestBodyProperties[it[0]] = { type: tr.type, required: tr.required };
                } else {
                  parameters.push({
                    name: it[0],
                    in: oasSource,
                    required: tr.required,
                    schema: {
                      // @ts-ignore
                      type: tr.type || "string"
                    }
                  });
                }

              });

            } else {

              if (oasSource === "body") {
                requestBodyProperties[argumentMeta.ctxValueOptions] = {
                  type: argumentMeta.argType?.name || "object",
                  required
                };
              } else{
                parameters.push({
                  name: argumentMeta.ctxValueOptions,
                  in: oasSource,
                  required,
                  schema: {
                    type: argumentMeta.argType?.name || "object"
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
                  properties: requestBodyProperties
                }
              },
              "application/x-www-form-urlencoded": {
                schema: {
                  type: "object",
                  properties: requestBodyProperties
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

  openApiSpec.paths = paths;
  openApiSpec.components.schemas = schemas;
  // @ts-ignore
  // openApiSpec.components.requestBodies = schemas;
  // console.log('OpenApi.init', meta);
}

function convertRegexpToSwagger(path) {
  const swaggerPath = [];

  let paramMode = false;
  for (const c of path) {

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


function deriveOasSoure(source) {
  switch (source) {
    case "params": {
      return "path";
    }
    default: {
      return source;
    }
  }
}




