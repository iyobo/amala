import boom from '@hapi/boom';
import Router from '@koa/router';
import {plainToClass} from 'class-transformer';
import {validate} from 'class-validator';
import {Context} from 'koa';
import _ from 'lodash';
import {isClass, isValidatableClass} from './tools';
import {AmalaOptions} from '../types/AmalaOptions';
import {AmalaMetadata, AmalaMetadataArgument, AmalaMetadataController} from '../types/metadata';

async function _argumentInjectorProcessor(name: string, body, injectOptions) {
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
 * Acts as a special override for non-trivial injections.
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
 * @param argument
 * @param options
 */
async function _determineArgument(
  ctx: Context,
  argument: AmalaMetadataArgument,
  options: AmalaOptions
) {
  let values;
  const {ctxKey, ctxValueOptions, argType} = argument;

  if (argumentInjectorTranslations[ctxKey]) {

    values = await argumentInjectorTranslations[ctxKey](ctx, ctxValueOptions);

  } else {
    // not a special arg injector? No special translation exists so just use CTX.
    values = ctx[ctxKey];
    if (values && ctxValueOptions) {
      values = values[ctxValueOptions];
    }

    // TODO: implement custom function capability here for arg injectors
  }

  // validate if this is a class and if this is a body, params, or query injection
  const shouldValidate = values && isValidatableClass(argType) && ['body', 'params', 'query'].includes(ctxKey);

  if (shouldValidate) {
    values = await plainToClass(argType, values, {enableImplicitConversion: true});

    const errors = await validate(values, options.validatorOptions); // TODO: wrap around this to trap runtime errors
    if (errors.length > 0) {
      throw boom.badData(
        'validation error for argument type: ' + ctxKey,
        errors.map(it => {
          return {field: it.property, violations: it.constraints};
        })
      );
    }

  } else if (values && argType && argType !== String) {
    values = argType(values);
  }

  return values;
}

async function _generateEndPoints(
  router: Router,
  options: AmalaOptions,
  controller: AmalaMetadataController,
  parentPath: string,
  generatingForVersion: string | number
) {
  // const controllerInstanceName = controller.targetClass.name + '__' + parentPath;


  let deprecationMessage = '';
  if (
    options.versions &&
    typeof options.versions[generatingForVersion] === 'string'
  ) {
    deprecationMessage = options.versions[generatingForVersion];
  }

  const endpoints = Object.values(controller.endpoints);

  // for each endpoint...
  for (const endpoint of endpoints) {
    let willAddEndpoint = true;

    // If API versioning mode is active...
    if (generatingForVersion) {
      // ...and endpoint has some version constraints defined...
      if (endpoint.limitToVersions && !_.isEmpty(endpoint.limitToVersions)) {
        const endpointLimit = endpoint.limitToVersions[generatingForVersion];

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
      if (endpoint.limitToVersions && !_.isEmpty(endpoint.limitToVersions)) {
        // , then ignore any endpoint handler with a @Version decorator. Default to catch-all-remainders
        willAddEndpoint = false;
      }
    }

    if (willAddEndpoint) {

      for (const endpointPath of endpoint.paths) {
        const path = '/' + (parentPath + '/' + endpointPath)
          .split('/')
          .filter(i => i.length)
          .join('/');

        // Add defined middlewares for this route
        const flow = [
          ...(controller?.flow || []),
          ...(endpoint?.flow || [])
        ];


        // And finally add leaf-level endpoint
        flow.push(async function endpointFunc(ctx) {

          const targetArguments = [];

          if (deprecationMessage) {
            ctx.set({deprecation: deprecationMessage});
          }

          // inject data into arguments
          if (endpoint.arguments) {
            for (const index of Object.keys(endpoint.arguments)) {
              const numIndex = Number(index);

              const argumentMeta = endpoint.arguments[numIndex];

              targetArguments[numIndex] = await _determineArgument(
                ctx,
                argumentMeta,
                options
              );
            }
          }

          // run target endpoint handler
          // ctx.body = await endpoint.target(...targetArguments);

          // Each request will create a new controller with the ctx passes as constuctor argument
          // eslint-disable-next-line new-cap
          const controllerInstance = new controller.targetClass(ctx);

          // bind to controller instance to allow for "this" within class when
          // accessing other class endpoints. e.g this.getOne
          ctx.body = await endpoint.targetMethod
            .bind(controllerInstance)(...targetArguments);

        });

        if (options.diagnostics) console.info(`Amala: generating ${endpoint.verb} ${path}`);
        router[endpoint.verb](path, ...flow);
      }
      ;

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
  router: Router,
  options: AmalaOptions,
  metadata: AmalaMetadata
) {

  if (options.diagnostics) {
    console.log('generating routes for Amala metadata...');
    console.dir(metadata, {depth: null});
  }

  const basePath = options.basePath || ''; // e.g /api
  const controllers = Object.values(metadata.controllers);

  // for each found controller
  for (const controller of controllers) {

    if (options.disableVersioning) {
      // enter endpoint without versioning e.g /api/users

      for (const path of controller.paths) {
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

        for (const path of controller.paths) {

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
