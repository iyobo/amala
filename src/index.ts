import {generateRoutes} from './util/generateRoutes';
import {importClassesFromDirectories} from './util/importClasses';
import Boom from '@hapi/boom';
import {ValidatorOptions} from 'class-validator';
import {openApi, openApiSpec} from './openapi/OpenApi';
import Application from 'koa';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';


export interface KoaControllerOptions {
  app?: Application;
  controllers: Array<string | Function>;
  basePath?: string;
  versions?: Array<number | string> | { [key: string]: string | boolean };
  disableVersioning?: boolean;
  router?: any;
  flow?: Array<(ctx, next) => Promise<void>>;
  errorHandler?: (err, ctx) => Promise<void>;

  // if true, will attach generated routes to the koa app. Don't set to true if you need to use app.use(...)
  attachRoutes?: boolean;

  // options for class-validator
  validatorOptions?: ValidatorOptions;

  //openApi
  enableOpenApi?: boolean;
  openApiPath?: string;
  openApiInfo?: {
    title: string;
    version: string;
  };

  // body parser options
  bodyParserOptions?: any;
}

export let options: KoaControllerOptions;
export const metadata = {
  controllers: {}
};

export interface ControllerCodex {
  [k: string]: {
    actions: {
      [ak: string]: {
        flow?: Array<Function>;
        verb: string;
        path: string;
        target: Function;
        argumentTypes?: Array<any>;
      };
    };
    path: string | string[];
    class: any;
  };
}

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
  params: KoaControllerOptions
): Promise<{ app: Application; router: Router }> => {
  options = params;
  const app = options.app = options.app || new Koa();
  options.router = options.router || new Router();

  options.versions = options.versions || {1: true};
  options.flow = options.flow || [];
  options.validatorOptions = options.validatorOptions || {};
  options.errorHandler = options.errorHandler || defaultErrorHandler;

  options.enableOpenApi = options.enableOpenApi || true;
  options.openApiPath = options.openApiPath || '/api/docs';


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
      importClassesFromDirectories(controllerDef);
    } else {
      // if it is not a string, it means it is a class that has already been imported/required/loaded. No need to
      // do anything else. Encourage users to still add the controller classes here even though the
      // decorators already load things up, for possible future needs.
    }
  }

  await generateRoutes(options.router, options, metadata);

  //open api
  if (options.enableOpenApi) {
    //Generate OpenAPI/Swagger spec
    await openApi.init(metadata);

    if(options.openApiInfo) {
      openApiSpec.info = options.openApiInfo;
    }

    options.router.get(options.openApiPath, (ctx) => {
      ctx.body = openApiSpec;
    });
  }

  //body parer
  app.use(bodyParser(options.bodyParserOptions))

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
