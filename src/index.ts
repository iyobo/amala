import 'reflect-metadata';
import {generateRoutes} from './util/generateRoutes';
import {importClassesFromDirectories} from './util/importClasses';
import Boom from '@hapi/boom';
import {generateOpenApi, openApiSpec} from './openapi/OpenApi';
import Router from 'koa-router';
import bodyParser from 'koa-body';
import {addArgumentInjectMeta} from './util/tools';
import Application from 'koa';
import koaHelmet from 'koa-helmet';
import {AmalaOptions} from './types/AmalaOptions';
import {KoaBodyOptions} from './types/KoaBodyOptions';
import {ControllerCodex} from './types/ControllerCodex';
import {HelmetOptions} from 'helmet';

const unparsed = require('koa-body/unparsed.js');

export let options: AmalaOptions;
export const metadata = {
  controllers: {}
};

export function getControllers(): ControllerCodex {
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

export const controllers = {};

/**
 *
 * @param app - Koa instance
 * @param params - KoaControllerOptions
 */
export const bootstrapControllers = async (
  params: AmalaOptions
): Promise<{ app: Application; router: Router }> => {
  options = params;
  const app = options.app = options.app || new Application();
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
  options.openAPI.path = options.openAPI.path || '/api/docs';
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
  if (Array.isArray(options.versions)) {
    const versions = {};

    options.versions.forEach(version => {
      versions[version] = true;
    });
    options.versions = versions;
  }

  // error handling middleware
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      options.errorHandler(err, ctx);
    }
  });

  // We don't need to do anything with the array of Controller classes these
  // return because the decorators have already loaded up the classes into metadata.
  // The Controller class files just need to be touched and they will handle their own registration in metadata
  for (const controllerDef of options.controllers) {
    if (typeof controllerDef === 'string') {
      if (options.diagnostics) console.info(`Amala: munching controllers in path ${controllerDef}`);
      importClassesFromDirectories(controllerDef); // this is a string glob path. Load controllers from path
    } else {
      // if it is not a string, it means it is a class that has already been imported/required/loaded. No need to
      // do anything else. Encourage users to still add the controller classes here even though the
      // decorators already load things up, for possible future needs.
    }
  }

  await generateRoutes(options.router, options, metadata);

  // open api
  if (options.openAPI.enabled) {
    // Generate OpenAPI/Swagger spec
    await generateOpenApi(metadata, options);

    options.router.get(options.openAPI.path, (ctx) => {
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
export {
  Body,
  Controller,
  Ctx,
  Delete,
  Flow,
  Get,
  Header,
  File,
  CurrentUser,
  Params,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  Session,
  State,
  Version
} from './decorators';

/**
 * Allows for custom Decorators to be created by developers.
 */
export const addArgumentDecorator = addArgumentInjectMeta;

export const errors = Boom