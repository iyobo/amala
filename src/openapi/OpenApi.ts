import {OpenAPIV3_1} from 'openapi-types';
import * as _ from 'lodash';
import {AmalaOptions} from '../types/AmalaOptions';


export interface AmalaMetadataAction {
  flow: (ctx, next) => Promise<unknown>
  verb: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string,
  arguments: Record<number, { injectSource: any, injectOptions: any }>,
  argumentTypes: any[], // ??? returns?
  target: () => Promise<unknown>
}

export interface AmalaMetadataController {
  path: string,
  actions: Record<string, AmalaMetadataAction>
}

export interface AmalaMetadata {
  controllers: Record<string, AmalaMetadataController>;
}

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
    const controllerMeta = meta.controllers[controllerClassName];
    const basePath = controllerMeta.path;

    for (const actionName in controllerMeta.actions) {
      // e.g getUsers
      const actionMeta = controllerMeta.actions[actionName];
      const fullPath = convertRegexpToSwagger(basePath + (actionMeta.path === '/' ? '' : actionMeta.path));
      const verb = actionMeta.verb;

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
      for (const argId in actionMeta.arguments) {
        const argInjectionDetails = actionMeta.arguments[argId];

        const argType = actionMeta.argumentTypes?.[argId];

        // register unregistered schemas
        if(argType) registerSchema(argType);

        const injectSource = argInjectionDetails.injectSource;
        const injectOptions = argInjectionDetails.injectOptions;
        const injectOptionsType = typeof argInjectionDetails.injectOptions;
        let required = false;
        const name = injectOptions;

        const argExistsIn = convertInjectSource(argInjectionDetails.injectSource);

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
      //   'meta-'+actionMeta.target.name,
      //   Reflect.getMetadata('design:type', actionMeta.target()),
      //   Reflect.getMetadata('design:paramtypes',  actionMeta.target),
      //   Reflect.getMetadata('design:returntype', actionMeta.target)
      // );

      // finalize iteration changes of path
      paths[fullPath][verb] = {
        operationId: `${controllerClassName}.${actionName}`,
        summary: actionName,
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


    }
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

