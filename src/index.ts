import 'reflect-metadata';
import Router from '@koa/router';
import {generateRoutes} from './util/generateRoutes';
import {importClassesFromDirectories} from './util/importClasses';
import * as Boom from '@hapi/boom';
import {generateOpenApi, openApiSpec} from './openapi/OpenApi';
import bodyParser from 'koa-body';
import KoaApplication = require('koa');
import koaHelmet from 'koa-helmet';
import {AmalaOptions} from './types/AmalaOptions';
import {KoaBodyOptions} from './types/KoaBodyOptions';
import {AmalaMetadata} from './types/metadata';
import {AmalaContext, EmptyContext} from './types/context';
import {addArgumentInjectMeta} from './decorators/common';
import {koaSwagger} from 'koa2-swagger-ui';

import cors from '@koa/cors';


export let options: AmalaOptions;

export const metadata: AmalaMetadata = {
  controllers: {}
};

export function getControllers() {
  return metadata.controllers;
}

const logInternalError = (statusCode: number): void => {
  console.error(`Amala: request failed with status ${statusCode}`);
};

const defaultErrorHandler = async (
  err: unknown,
  ctx: AmalaContext
): Promise<void> => {
  if (Boom.isBoom(err)) {
    const error = {...err.output.payload};
    error.errorDetails = error.statusCode >= 500 ? undefined : err.data;
    ctx.body = error;
    ctx.status = error.statusCode;
    if (error.statusCode >= 500) logInternalError(error.statusCode);
  } else {
    ctx.body = {error: 'Internal Server Error'};
    ctx.status = 500;
    logInternalError(500);
  }
};

const addLegacyFileMetadataAliases = (files: unknown): void => {
  if (!files || typeof files !== 'object') return;

  const fileValues = Array.isArray(files) ? files : Object.values(files);
  for (const value of fileValues) {
    if (Array.isArray(value)) {
      addLegacyFileMetadataAliases(value);
      continue;
    }
    if (!value || typeof value !== 'object') continue;

    const file = value as Record<string, unknown>;
    if (!('name' in file) && 'originalFilename' in file) {
      file.name = file.originalFilename;
    }
    if (!('type' in file) && 'mimetype' in file) {
      file.type = file.mimetype;
    }
  }
};

/**
 *
 * @param app - Koa instance
 * @param params - KoaControllerOptions
 */
export const bootstrapControllers = async <
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext
>(
  params: AmalaOptions<StateT, ContextT>
): Promise<{
  app: KoaApplication<StateT, ContextT>;
  router: Router<StateT, ContextT>;
}> => {
  const configuredOptions = params;
  options = params as unknown as AmalaOptions;
  const app = configuredOptions.app = configuredOptions.app || new KoaApplication<StateT, ContextT>();
  configuredOptions.router = configuredOptions.router || new Router<StateT, ContextT>();

  configuredOptions.versions = configuredOptions.versions || {1: true};

  configuredOptions.flow = configuredOptions.flow || [];

  if (configuredOptions.useHelmet) {
    const opts = configuredOptions.useHelmet === true ? undefined : configuredOptions.useHelmet;
    const helmetMiddleware = koaHelmet(opts as Parameters<typeof koaHelmet>[0]);
    configuredOptions.flow = [
      helmetMiddleware as unknown as typeof configuredOptions.flow[number],
      ...configuredOptions.flow
    ];
  }

  configuredOptions.validatorOptions = configuredOptions.validatorOptions || {};
  configuredOptions.errorHandler = configuredOptions.errorHandler || defaultErrorHandler;

  configuredOptions.openAPI = {
    enabled: true,
    publicURL: '',
    ...configuredOptions.openAPI
  };
  const openAPIBasePath = configuredOptions.basePath || '';
  configuredOptions.openAPI.specPath = `${openAPIBasePath}/${configuredOptions.openAPI.specPath || 'docs'}`;
  configuredOptions.openAPI.webPath = `${openAPIBasePath}/${configuredOptions.openAPI.webPath || 'swagger'}`;
  configuredOptions.openAPI.spec = configuredOptions.openAPI.spec || {};

  configuredOptions.bodyParser = configuredOptions.bodyParser === false ? false : configuredOptions.bodyParser;
  configuredOptions.diagnostics = configuredOptions.diagnostics || false;

  configuredOptions.cors = configuredOptions.cors || {enabled: true, opts: {}};


  /**
   * Versions can be defined in multiple ways.
   * If an array, it's just a list of active versions.
   * If as an object, then this datastructure can define not only active versions but obsolete versions as well.
   *
   * The object is the native form. Arrays are converted to object.
   */

  // if versions are in array for, convert to object
  if (Array.isArray(configuredOptions.versions)) {
    const versions: Record<string, string | boolean> = {};

    configuredOptions.versions.forEach(version => {
      versions[version] = true;
    });
    configuredOptions.versions = versions;
  }

  // CORS
  if (configuredOptions.cors?.enabled) {
    app.use(cors(configuredOptions.cors.opts));
  }

  // Amala's Error handling middleware
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      await configuredOptions.errorHandler(err, ctx);
    }
  });

  /**
   * We don't need to do anything with the array of Controller classes thesse return because the decorators have
   * already loaded up the classes into metadata.
   *
   * The Controller class files just need to be loaded. They will handle their own registration in metadata
   */

  for (const controllerDef of configuredOptions.controllers) {
    if (typeof controllerDef === 'string') {
      // This is a path. get all controllers in that folder
      if (configuredOptions.diagnostics) console.info(`Amala: munching controllers in path ${controllerDef}`);
      importClassesFromDirectories(controllerDef); // this is a string glob path. Load controllers from path
    } else {
      /**
       * These are actual classes so Nothing to do here.
       * Their decorators have already registered them in the metadata.
       */
    }
  }

  // Register all global flows
  configuredOptions.flow.forEach(flow=>{
    app.use(flow)
  })

  //
  await generateRoutes(configuredOptions.router, configuredOptions, metadata);

  // open api
  if (configuredOptions.openAPI.enabled) {
    // Generate OpenAPI/Swagger spec
    await generateOpenApi(metadata, configuredOptions);

    configuredOptions.router.get(configuredOptions.openAPI.specPath, (ctx) => {
      ctx.body = openApiSpec;
    });

    if (configuredOptions.openAPI.webPath) {
      app.use(
        koaSwagger({
          routePrefix: configuredOptions.openAPI.webPath, // host at /swagger instead of default /docs
          swaggerOptions: {
            url: `${configuredOptions.openAPI.publicURL}${configuredOptions.openAPI.specPath}`, // example path to json
          },
        }),
      );
    }
  }

  // body parser
  if (configuredOptions.bodyParser !== false) {
    app.use(bodyParser({
      multipart: true,
      ...configuredOptions.bodyParser as KoaBodyOptions
    } as Parameters<typeof bodyParser>[0]));
    app.use(async (ctx, next) => {
      addLegacyFileMetadataAliases(ctx.request.files);
      await next();
    });
  }

  if (configuredOptions.attachRoutes) {
    // Combine routes
    app.use(configuredOptions.router.routes());
    app.use(configuredOptions.router.allowedMethods({
      methodNotAllowed: () => Boom.notFound(),
      notImplemented: () => Boom.notImplemented(),
      throw: true,
    }));
  }

  return {app, router: configuredOptions.router};
};

export * from 'class-validator';
export * from 'class-transformer';

/**
 * Allows for custom Decorators to be created by developers.
 */
export const addArgumentDecorator = addArgumentInjectMeta;

export {errors} from './util/errors';
export type {
  AmalaOptions,
  ControllerClass,
  ControllerFactory,
  ErrorHandler
} from './types/AmalaOptions';
export type {
  AmalaContext,
  AmalaMiddleware,
  AmalaNext,
  EmptyContext
} from './types/context';
export type Context<
  StateT extends object = EmptyContext,
  ContextT extends object = EmptyContext,
  ResponseBodyT = unknown
> = AmalaContext<StateT, ContextT, ResponseBodyT>;
// export {Ctx} from './decorators/endpoints/args/ctx';
// export {Query} from './decorators/endpoints/args/query';
// export {Params} from './decorators/endpoints/args/params';
// export {Res} from './decorators/endpoints/args/res';
// export {File} from './decorators/endpoints/args/file';
// export {Req} from './decorators/endpoints/args/req';
// export {State} from './decorators/endpoints/args/state';
// export {CurrentUser} from './decorators/endpoints/args/currentUser';
// export {Session} from './decorators/endpoints/args/session';
// export {Body} from './decorators/endpoints/args/body';
// export {Header} from './decorators/endpoints/args/header';
// export {Flow} from './decorators/hybrid/flow';
// export {Version} from './decorators/endpoints/version';
// export {Delete} from './decorators/endpoints/delete';
// export {Patch} from './decorators/endpoints/patch';
// export {Put} from './decorators/endpoints/put';
// export {Post} from './decorators/endpoints/post';
// export {Get} from './decorators/endpoints/get';
// export {Controller} from './decorators/controllers/controller';

export * from './decorators';
