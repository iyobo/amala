import {OpenAPIV3_1} from 'openapi-types';

export const openApiSpec: OpenAPIV3_1.Document = {
  'info': {
    'title': '',
    'version': '1.0.0'
  },
  'openapi': '3.0.0',
  'components': {
    'schemas': {}
  },
  'paths': {}
};


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
function convertPrimitives(type) {
  switch (type) {
    case 'params': {
      return 'path';
    }
    default: {
      return type;
    }
  }
}



class OpenApi {

  async init(metaData: any) {
    const meta = metaData;

    // used to build up the paths section of the openAPI spec
    const paths = {};
    const schemas = {};

    function registerSchema(obj) {

      // "Category": {
      //   "type": "object",
      //     "properties": {
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

        //loop through props
        for (const [key, value] of Object.entries(obj)) {
          properties[key] = typeof value
        }

        schemas[obj.name] = {
          type: 'object',
          properties
        }
      }
    }

    for (const controllerClassName in meta.controllers) {
      //e.g UserController
      const controller = meta.controllers[controllerClassName];
      const basePath = controller.path;
      const classO = controller.class;


      for (const actionName in controller.actions) {
        //e.g getUsers
        const actionValue = controller.actions[actionName];
        const fullPath = basePath + actionValue.path;
        const verb = actionValue.verb;

        paths[fullPath] = paths[fullPath] || {};

        const parameters = [
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
        for (const argId in actionValue.arguments) {
          const argInjectionDetails = actionValue.arguments[argId];
          const argType = actionValue.argumentTypes[argId];

          //register unregistered schemas
          registerSchema(argType);

          const injectSource = argInjectionDetails.injectSource;
          const injectOptions = argInjectionDetails.injectOptions;
          const injectOptionsType = typeof argInjectionDetails.injectOptions;
          let required = false;
          let name = injectOptions;

          const argExistsIn = convertInjectSource(argInjectionDetails.injectSource);

          if (injectOptions && injectOptionsType !== 'string') {
            // injection object
            required = injectOptions.required || false;
          }

          // if the argument exists as part of path, consider to be required
          if (argExistsIn === 'path') {
            required = true;
          }


          parameters.push({
            in: argExistsIn,
            name,
            required,
            schema: {
              type: argType.name
            }
          });
        }


        // finalize iteration changes of path
        paths[fullPath][verb] = {
          'operationId': `${controllerClassName}.${actionName}`,
          parameters,
          'responses': {
            '2xx': { //TODO: more details
              'content': {
                'application/json': {}
              },
              'description': 'Successful response'
            }
          },
          'summary': actionName,
          'tags': [
            controllerClassName
          ]
        };


      }
    }

    openApiSpec.paths = paths;
    openApiSpec.components.schemas = schemas;
    // console.log('OpenApi.init', meta);
  }

}

export const openApi = new OpenApi();