import boom from '@hapi/boom';
import Router, {RouterContext} from '@koa/router';
import {plainToClass} from 'class-transformer';
import {validate, ValidationError} from 'class-validator';
import _ from 'lodash';
import {isClass, isValidatableClass} from './tools';
import {AmalaOptions, ControllerClass} from '../types/AmalaOptions';
import {AmalaMetadata, AmalaMetadataArgument, AmalaMetadataController, FlowFunction} from '../types/metadata';
import {AmalaContext, EmptyContext} from '../types/context';

function readProperty(value: unknown, key: string): unknown {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) {
    return undefined;
  }
  return (value as Record<string, unknown>)[key];
}

async function _argumentInjectorProcessor(
  name: string,
  body: unknown,
  injectOptions: unknown
): Promise<unknown> {
  if (!injectOptions) {
    return body;
  }

  if (typeof injectOptions === 'string') {
    return readProperty(body, injectOptions);
  } else if (injectOptions && typeof injectOptions === 'object') {
    // is required
    if (readProperty(injectOptions, 'required') === true && (!body || _.isEmpty(body))) {
      throw boom.badData('Body: is required and cannot be null');
    }

    return body;
  }

  throw boom.badImplementation(
    `${name}: Cannot handle injection options ${String(injectOptions)}`
  );
}

/**
 * Acts as a special override for non-trivial injections.
 * e.g "query" should be searched for in ctx.request, not ctx.
 */
type ArgumentInjector = (
  ctx: AmalaContext,
  injectOptions: unknown
) => Promise<unknown>;

const argumentInjectorTranslations: Record<string, ArgumentInjector> = {
  session: async (ctx, injectOptions) => {
    const session = readProperty(ctx, 'session');
    if (!session)
      throw boom.failedDependency(
        'Sessions have not been activated on this server'
      );

    if (typeof injectOptions === 'string') {
      return readProperty(session, injectOptions);
    }
    return session;
  },
  ctx: async ctx => ctx,
  query: async (ctx, injectOptions) => {
    return _argumentInjectorProcessor('query', readProperty(ctx, 'query'), injectOptions);
  },
  currentUser: async (ctx, injectOptions) => {
    return _argumentInjectorProcessor('currentUser', readProperty(ctx.state, 'user'), injectOptions);
  },
  body: async (ctx, injectOptions) => {
    return _argumentInjectorProcessor('body', readProperty(ctx.request, 'body'), injectOptions);
  },
  request: async (ctx, injectOptions) => {
    if (injectOptions === 'files') {
      return readProperty(ctx.request, 'files') ?? readProperty(ctx.request, 'file');
    }
    return _argumentInjectorProcessor('request', ctx.request, injectOptions);
  }
};

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = ''
): Array<{field: string; violations: Record<string, string>}> {
  return errors.flatMap(error => {
    const field = [parentPath, error.property].filter(Boolean).join('.');
    const ownViolations = error.constraints
      ? [{field, violations: error.constraints}]
      : [];
    const childViolations = flattenValidationErrors(error.children || [], field);

    return [...ownViolations, ...childViolations];
  });
}

/**
 * Processes an endpoint-function argument and validates it etc
 * @param ctx
 * @param argument
 * @param options
 */
async function _determineArgument<
  StateT extends object,
  ContextT extends object
>(
  ctx: AmalaContext<StateT, ContextT>,
  argument: AmalaMetadataArgument,
  options: AmalaOptions<StateT, ContextT>
): Promise<unknown> {
  let values: unknown;
  const {ctxKey, ctxValueOptions, argType} = argument;

  const translator = ctxKey ? argumentInjectorTranslations[ctxKey] : undefined;
  if (translator) {

    values = await translator(ctx, ctxValueOptions);

  } else if (ctxKey) {
    // not a special arg injector? No special translation exists so just use CTX.
    values = readProperty(ctx, ctxKey);
    if (values && typeof ctxValueOptions === 'string') {
      values = readProperty(values, ctxValueOptions);
    }

    // TODO: implement custom function capability here for arg injectors
  }

  // validate if this is a class and if this is a body, params, or query injection
  const shouldValidate = values && isValidatableClass(argType) && ctxKey
    && ['body', 'params', 'query'].includes(ctxKey);

  if (shouldValidate) {
    const transformed = plainToClass<object, unknown>(
      argType,
      values,
      {enableImplicitConversion: true}
    );
    values = transformed;

    const errors = await validate(transformed, options.validatorOptions); // TODO: wrap around this to trap runtime errors
    if (errors.length > 0) {
      throw boom.badData(
        'validation error for argument type: ' + ctxKey,
        flattenValidationErrors(errors)
      );
    }

  } else if (values && typeof argType === 'function' && argType !== String) {
    values = (argType as unknown as (value: unknown) => unknown)(values);
  }

  return values;
}

async function _generateEndPoints<
  StateT extends object,
  ContextT extends object
>(
  router: Router<StateT, ContextT>,
  options: AmalaOptions<StateT, ContextT>,
  controller: AmalaMetadataController<StateT, ContextT>,
  parentPath: string,
  generatingForVersion?: string | number
) {
  // const controllerInstanceName = controller.targetClass.name + '__' + parentPath;


  let deprecationMessage = '';
  if (
    options.versions &&
    !Array.isArray(options.versions) &&
    typeof options.versions[generatingForVersion] === 'string'
  ) {
    deprecationMessage = options.versions[generatingForVersion];
  }

  const endpoints = Object.values(controller.endpoints || {});

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

      for (const endpointPath of endpoint.paths || []) {
        const path = '/' + (parentPath + '/' + endpointPath)
          .split('/')
          .filter(i => i.length)
          .join('/');

        // Add defined middlewares for this route
        const flow: FlowFunction<StateT, ContextT>[] = [
          ...(controller?.flow || []),
          ...(endpoint?.flow || [])
        ];


        // And finally add leaf-level endpoint
        flow.push(async function endpointFunc(ctx: RouterContext<StateT, ContextT>) {

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

          // Each request resolves its own controller instance. Existing
          // applications retain the original constructor-with-context behavior.
          if (!controller.targetClass || !endpoint.targetMethod) {
            throw boom.badImplementation('Incomplete controller metadata');
          }

          const ControllerClass = controller.targetClass as unknown as ControllerClass;
          let controllerInstance: object;
          if (options.controllerFactory) {
            controllerInstance = await options.controllerFactory(
              ControllerClass,
              ctx
            );
          } else {
            // eslint-disable-next-line new-cap
            controllerInstance = new ControllerClass(ctx);
          }

          if (!controllerInstance) {
            throw boom.badImplementation(
              `Controller factory did not return an instance for ${ControllerClass.name}`
            );
          }

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
export async function generateRoutes<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext
>(
  router: Router<StateT, ContextT>,
  options: AmalaOptions<StateT, ContextT>,
  metadata: AmalaMetadata<StateT, ContextT>
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

      for (const path of controller.paths || []) {
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

        for (const path of controller.paths || []) {

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
