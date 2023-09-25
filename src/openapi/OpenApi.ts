import {OpenAPIV3_1} from 'openapi-types';
import * as _ from 'lodash';
import {AmalaOptions} from '../types/AmalaOptions';
import {AmalaMetadata} from '../types/metadata';


export let openApiSpec: OpenAPIV3_1.Document = {
  openapi: '3.0.1',
  info: {
    'title': 'API',
    description: 'powered by AmalaJS (https://github.com/iyobo/amala)',
    'version': '1.0.0'
  },
  servers: [],
  paths: {},
  components: {
    'schemas': {}
  },
  security: [],
  tags: [],
  externalDocs: undefined
};

function convertRegexpToSwagger(path) {
  const swaggerPath = [];

  let paramMode = false;
  for (const c of path) {

    if (c === ':') {
      paramMode = true;
      swaggerPath.push('{');
    } else if (paramMode && c === '/') {
      paramMode = false;
      swaggerPath.push('}/');
    } else {
      swaggerPath.push(c);
    }
  }

  if (paramMode) swaggerPath.push('}');

  return swaggerPath.join('');
}

export function generateOpenApi(metaData: AmalaMetadata, options: AmalaOptions) {

  // incorporate custom spec values
  openApiSpec = _.merge(openApiSpec, options.openAPI.spec);

  // overwrite default info with developer's API info. handled by deep merge
  // openApiSpec.info = {...openApiSpec.info, ...options.openAPI.spec.info};

  const meta = {...metaData};

  // used to build up the paths section of the openAPI spec
  const paths: OpenAPIV3_1.PathsObject = {};

  const schemas: Record<string, OpenAPIV3_1.SchemaObject> = {};

  // ---- SERVERS
  const servers: OpenAPIV3_1.ServerObject[] = [];
  const rootPath = options.openAPI.publicURL + options.basePath;

  if (!options.disableVersioning) {
    if (Array.isArray(options.versions)) {
      options.versions.forEach(it => {
        servers.push({
          url: rootPath + '/v' + it,
          description: `version ${it}`
        });
      });
    } else {
      for (const [k, v] of Object.entries(options.versions)) {
        if (v) {
          servers.push({
            url: rootPath + '/v' + k,
            description: `version ${k}`
          });
        }
      }
    }
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
    //         "format": "int64"
    //     },
    //     "name": {
    //       "type": "string"
    //     }
    //   }
    // }

    if (obj) {

      const properties = {};

      // loop through props
      for (const [key, value] of Object.entries(obj)) {
        properties[key] = typeof value;
      }

      schemas[obj.name] = {
        type: 'object',
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

      const basePath = convertRegexpToSwagger(controllerPath)

      for (const endpointName in controller.endpoints) {
        // e.g getUsers
        const endpoint = controller.endpoints[endpointName];

        endpoint.paths.forEach(endpointPath => {

          const fullPath = basePath + convertRegexpToSwagger( (endpointPath === '/' ? '' : endpointPath));
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

          // TODO: build parameter/ argument specs
          for (const argId in endpoint.arguments) {
            const argInjectionDetails = endpoint.arguments[argId];

            const argType = endpoint.argumentTypes?.[argId];

            // register unregistered schemas
            if (argType) registerSchema(argType);

            const injectSource = argInjectionDetails.ctxKey;
            const injectOptions = argInjectionDetails.ctxValueOptions;
            const injectOptionsType = typeof argInjectionDetails.ctxValueOptions;
            let required = false;
            const name = injectOptions;

            const argExistsIn = convertInjectSource(argInjectionDetails.ctxKey);

            if (injectOptions && injectOptionsType !== 'string') {
              // injection object
              required = injectOptions.required || false;
            }

            // if the argument exists as part of path, consider to be required
            if (argExistsIn === 'path') {
              required = true;
            }

            // eslint-disable-next-line new-cap
            // const refl = argType.name;
            // console.log(refl);
            parameters.push({
              in: argExistsIn,
              name,
              required,
              schema: {
                type: argType?.name || 'unknown'
              }
            });
          }

          // console.log(
          //   'meta-'+endpointMeta.target.name,
          //   Reflect.getMetadata('design:type', endpointMeta.target()),
          //   Reflect.getMetadata('design:paramtypes',  endpointMeta.target),
          //   Reflect.getMetadata('design:returntype', endpointMeta.target)
          // );

          // finalize iteration changes of path
          paths[fullPath][verb] = {
            operationId: `${controllerClassName}.${endpointName}`,
            summary: endpointName,
            tags: [
              controllerClassName
            ],
            parameters,
            responses: {
              '2xx': { // TODO: more details
                description: 'Successful response',
                headers: {},
                content: {
                  // @ts-ignore //????
                  'application/json': {
                    schema: {
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
  // console.log('OpenApi.init', meta);
}


function convertInjectSource(source) {
  switch (source) {
    case 'params': {
      return 'path';
    }
    default: {
      return source;
    }
  }
}

