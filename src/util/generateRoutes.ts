import boom from '@hapi/boom';
import {plainToClass} from 'class-transformer';
import {validate} from 'class-validator';
import {Context} from 'koa';
import _ from 'lodash';
import {isClass} from './tools';
import {AmalaOptions} from '../types/AmalaOptions';

async function _argumentInjectorProcessor(name, body, injectOptions) {
  if (!injectOptions) {
    return body;
  }

  if (typeof injectOptions === 'string') {
    return body[injectOptions];
  } else if (typeof injectOptions === 'object') {
    // is required
    if (injectOptions.required && (!body || _.isEmpty(body))) {
      throw boom.badData('Body: is required and cannot be null');
    }

    return body;
  }

  throw boom.badImplementation(
    `${name}: Cannot handle injection options ${injectOptions}`
  );
}

/**
 * Acts as a special override for non-simple injections.
 * e.g "query" should be searched for in ctx.request, not ctx.
 */
const argumentInjectorTranslations = {
  session: async (ctx: any, injectOptions: any) => {
    if (!ctx.session)
      throw boom.failedDependency(
        'Sessions have not been activated on this server'
      );

    if (typeof injectOptions === 'string') {
      return ctx.session[injectOptions];
    }
    return ctx.session;
  },
  ctx: async (ctx: any) => ctx,
  query: async (ctx: any, injectOptions: any) => {
    return _argumentInjectorProcessor('query', ctx.query, injectOptions);
  },
  currentUser: async (ctx: any, injectOptions: any) => {
    return _argumentInjectorProcessor('currentUser', ctx.state.user, injectOptions);
  },
  body: async (ctx: any, injectOptions: any) => {
    return _argumentInjectorProcessor('body', ctx.request.body, injectOptions);
  }
};

/**
 * Processes an endpoint-function argument and validates it etc
 * @param ctx
 * @param index
 * @param injectSource
 * @param injectOptions
 * @param type
 * @param options
 */
async function _determineArgument(
  ctx: Context,
  index: number,
  {injectSource, injectOptions},
  type,
  options: AmalaOptions
) {
  let values;

  if (argumentInjectorTranslations[injectSource]) {

    values = await argumentInjectorTranslations[injectSource](ctx, injectOptions);

  } else {
    // not a special arg injector? No special translation exists so just use CTX.
    values = ctx[injectSource];
    if (values && injectOptions) {
      values = values[injectOptions];
    }

    //TODO: implement custom function capability here for arg injectors
  }

  // validate if this is a class and if this is a body, params, or query injection
  const shouldValidate = values && isClass(type) && ['body', 'params', 'query'].includes(injectSource);

  if (shouldValidate) {
    values = await plainToClass(type, values);

    const errors = await validate(values, options.validatorOptions); // TODO: wrap around this to trap runtime errors

    if (errors.length > 0) {
      throw boom.badData(
        'validation error for argument type: ' + injectSource,
        errors.map(it => {
          return {field: it.property, violations: it.constraints};
        })
      );
    }
  } else if (type === Number) {
    values = Number(values);
  }

  return values;
}

async function _generateEndPoints(
  router,
  options: AmalaOptions,
  controller,
  parentPath: string,
  generatingForVersion: string | number
) {
  const actions = controller.actions;
  const controllerInstanceName = controller.class.name + '__' + controller.path;

  let deprecationMessage = '';
  if (
    options.versions &&
    typeof options.versions[generatingForVersion] === 'string'
  ) {
    deprecationMessage = options.versions[generatingForVersion];
  }

  const mappedActions = Object.keys(actions).map(action => actions[action]);
  // debugger;

  //for each endpoint
  for (const action of mappedActions) {
    let willAddEndpoint = true;

    // If API versioning mode is active...
    if (generatingForVersion) {
      // ...and endpoint has some version constraints defined...
      if (action.limitToVersions && !_.isEmpty(action.limitToVersions)) {
        const endpointLimit = action.limitToVersions[generatingForVersion];

        // ...and current endpoint version being generated does NOT exist in the constraint
        if (!endpointLimit) {
          // then ignore this version of the endpoint
          willAddEndpoint = false;
        }
        // but if current endpoint version being generated DOES exist in the constraint and it is a string...
        else if (typeof endpointLimit === 'string') {
          // ...this is a deprecation message
          deprecationMessage += ` ${endpointLimit}`;
        }
      }
    } else {
      // else If in-built api versioning mode is disabled...
      // ...and endpoint has some version constraints defined...
      if (action.limitToVersions && !_.isEmpty(action.limitToVersions)) {
        // , then ignore any endpoint handler with a @Version decorator. Default to catch-all-remainders
        willAddEndpoint = false;
      }
    }

    if (willAddEndpoint) {
      const path =
        '/' +
        (parentPath + action.path)
          .split('/')
          .filter(i => i.length)
          .join('/');

      // Add defined middlewares
      const flow = [
        ...(options?.flow || []),
        ...(controller?.flow || []),
        ...(action?.flow || [])
      ];


      // And finally add leaf-level endpoint
      flow.push(async function endpoint(ctx) {

        const targetArguments = [];

        if (deprecationMessage) {
          ctx.set({deprecation: deprecationMessage});
        }

        // inject data into arguments
        if (action.arguments) {
          for (const index of Object.keys(action.arguments)) {
            const numIndex = Number(index);

            const argumentMeta = action.arguments[numIndex];

            targetArguments[numIndex] = await _determineArgument(
              ctx,
              numIndex,
              argumentMeta,
              action.argumentTypes[numIndex],
              options
            );
          }
        }

        // run target endpoint handler
        // ctx.body = await action.target(...targetArguments);
        
        // Each request will create a new controller with the ctx passes as constuctor argument
        const controllerInstance = new controller.class(ctx);
        
        // bind to controller instance to allow for "this" within class when
        // accessing other class actions. e.g this.getOne
        ctx.body = await action.target
          .bind(controllerInstance)(...targetArguments);

      });

      if (options.diagnostics) console.info(`Amala: generating ${action.verb} ${path}`);
      router[action.verb](path, ...flow);
    }
  }
}

/**
 * Fill up router with routes
 * @param router
 * @param options
 * @param metadata
 */
export async function generateRoutes(
  router,
  options: AmalaOptions,
  metadata
) {
  const basePath = options.basePath || ''; // e.g /api
  const controllers: any[] = Object.values(metadata.controllers);

  // for each found controller
  for (const controller of controllers) {
    const paths = Array.isArray(controller.path)
      ? controller.path
      : [controller.path];

    if (options.disableVersioning) {
      // enter endpoint without versioning e.g /api/users

      for (const path of paths) {
        await _generateEndPoints(
          router,
          options,
          controller,
          basePath + path,
          undefined
        );
      }
    } else {
      // enter endpoint with versioning e.g /api/v1/user

      const versions = _.isArray(options.versions)
        ? options.versions
        : _.keysIn(options.versions);
      for (const version of versions) {
        for (const path of paths) {
          await _generateEndPoints(
            router,
            options,
            controller,
            basePath + `/v${version}` + path,
            version
          );
        }
      }
    }
  }
}
