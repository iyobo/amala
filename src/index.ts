import 'reflect-metadata';
import {generateRoutes} from './util/generateRoutes';
import {importClassesFromDirectories} from './util/importClasses';
import Boom from '@hapi/boom';
import {generateOpenApi, openApiSpec} from './openapi/OpenApi';
import Router from 'koa-router';
import bodyParser from 'koa-body';
import KoaApplication from 'koa';
import koaHelmet from 'koa-helmet';
import {AmalaOptions} from './types/AmalaOptions';
import {KoaBodyOptions} from './types/KoaBodyOptions';
import {HelmetOptions} from 'helmet';
import {AmalaMetadata} from './types/metadata';
import {addArgumentInjectMeta} from './decorators/common';


export let options: AmalaOptions;

export const metadata: AmalaMetadata = {
  controllers: {}
};

export function getControllers() {
  return metadata.controllers;
}

const defaultErrorHandler = async (err: any, ctx: any) => {
  if (err.isBoom) {
    const error = err.output.payload;
    error.errorDetails = error.statusCode >= 500 ? undefined : err.data;
    ctx.body = error;
    ctx.status = error.statusCode;
    if (error.statusCode >= 500) console.error(err);
  } else {
    ctx.body = {error: 'Internal Server Error'};
    ctx.status = 500;
    console.error(err);
  }
};

/**
 *
 * @param app - Koa instance
 * @param params - KoaControllerOptions
 */
export const bootstrapControllers = async (
  params: AmalaOptions
): Promise<{ app: KoaApplication; router: Router }> => {
  options = params;
  const app = options.app = options.app || new KoaApplication();
  options.router = options.router || new Router();

  options.versions = options.versions || {1: true};

  options.flow = options.flow || [];

  if (options.useHelmet) {
    const opts: HelmetOptions = options.useHelmet === true ? undefined : options.useHelmet;
    options.flow = [koaHelmet(opts), ...options.flow];
  }

  options.validatorOptions = options.validatorOptions || {};
  options.errorHandler = options.errorHandler || defaultErrorHandler;

  options.openAPI = options.openAPI || {enabled: true, publicURL: 'http://[publicURl]'};
  options.openAPI.specPath = `${options.basePath}/${options.openAPI.specPath || 'docs'}`;
  options.openAPI.spec = options.openAPI.spec || openApiSpec;

  options.bodyParser = options.bodyParser === false ? false : options.bodyParser;
  options.diagnostics = options.diagnostics || false;


  /**
   * Versions can be defined in multiple ways.
   * If an array, it's just a list of active versions.
   * If as an object, then this datastructure can define not only active versions but obsolete versions as well.
   *
   * The object is the native form. Arrays are converted to object.
   */

  // if versions are in array for, convert to object
  if (Array.isArray(options.versions)) {
    const versions = {};

    options.versions.forEach(version => {
      versions[version] = true;
    });
    options.versions = versions;
  }

  // Amala's Error handling middleware
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      await options.errorHandler(err, ctx);
    }
  });

  /**
   * We don't need to do anything with the array of Controller classes thesse return because the decorators have
   * already loaded up the classes into metadata.
   *
   * The Controller class files just need to be loaded. They will handle their own registration in metadata
   */

  for (const controllerDef of options.controllers) {
    if (typeof controllerDef === 'string') {
      if (options.diagnostics) console.info(`Amala: munching controllers in path ${controllerDef}`);
      importClassesFromDirectories(controllerDef); // this is a string glob path. Load controllers from path
    } else {
      /**
       * These are actual classes so Nothing to do here.
       * Their decorators have already registered them in the metadata.
       */
    }
  }

  await generateRoutes(options.router, options, metadata);

  // open api
  if (options.openAPI.enabled) {
    // Generate OpenAPI/Swagger spec
    await generateOpenApi(metadata, options);

    options.router.get(options.openAPI.specPath, (ctx) => {
      ctx.body = openApiSpec;
    });
  }

  // body parser
  if (options.bodyParser !== false) {
    app.use(bodyParser({
      ...options.bodyParser as KoaBodyOptions,
      // includeUnparsed: true,
      multipart: true
    }));
  }

  if (options.attachRoutes) {
    // Combine routes
    app.use(options.router.routes());
    app.use(options.router.allowedMethods({
      methodNotAllowed: () => Boom.notFound(),
      notImplemented: () => Boom.notImplemented(),
      throw: true,
    }));
  }

  return {app, router: options.router};
};

export * from 'class-validator';
export * from 'class-transformer';

/**
 * Allows for custom Decorators to be created by developers.
 */
export const addArgumentDecorator = addArgumentInjectMeta;

export {errors} from './util/errors';
export type Context = KoaApplication.Context
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