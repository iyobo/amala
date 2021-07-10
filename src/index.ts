import 'reflect-metadata';
import {generateRoutes} from './util/generateRoutes';
import {importClassesFromDirectories} from './util/importClasses';
import Boom from '@hapi/boom';
import {ValidatorOptions} from 'class-validator';
import {openApi, openApiSpec} from './openapi/OpenApi';
import Application from 'koa';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-body';
import {addArgumentInjectMeta} from './util/tools';
const unparsed = require('koa-body/unparsed.js');

export type KoaBodyOptions = {
  // Patch request body to Node's ctx.req, default false
  patchNode?: boolean;
  //Patch request body to Koa's ctx.request, default true
  patchKoa?: boolean;
  //The byte (if integer) limit of the JSON body, default 1mb
  jsonLimit?: string | number;
  //The byte (if integer) limit of the form body, default 56kb
  formLimit?: string | number;
  //The byte (if integer) limit of the text body, default 56kb
  textLimit?: string | number;
  //Sets encoding for incoming form fields, default utf-8
  encoding?: string;
  //Parse multipart bodies, default false
  multipart?: boolean;
  //Parse urlencoded bodies, default true
  urlencoded?: boolean;
  //Parse text bodies, such as XML, default true
  text?: boolean;
  //Parse JSON bodies, default true
  json?: boolean;
  //Toggles co-body strict mode; if set to true - only parses arrays or objects, default true
  jsonStrict?: boolean;
  //Toggles co-body returnRawBody option; if set to true, for form encodedand and JSON requests the raw, unparsed requesty body will be attached to ctx.request.body using a Symbol, default false
  includeUnparsed?: boolean;

  // See formidable for options
  formidable?: {
    //Limits the number of fields that the querystring parser will decode, default 1000
    maxFields?: number;
    //Limits the amount of memory all fields together (except files) can allocate in bytes. If this value is exceeded, an 'error' event is emitted, default 2mb (2 * 1024 * 1024)
    maxFieldsSize?: number;
    //Sets the directory for placing file uploads in, default os.tmpDir()
    uploadDir?: string;
    //Files written to uploadDir will include the extensions of the original files, default false
    keepExtensions?: boolean;
    //If you want checksums calculated for incoming files, set this to either 'sha1' or 'md5', default false
    hash?: string;
    //Multiple file uploads or no, default true
    multiples?: boolean;
    //Special callback on file begin. The function is executed directly by formidable. It can be used to rename files before saving them to disk. See the docs
    onFileBegin?: (name: string, file: any) => void;
  };
  //Custom error handle, if throw an error, you can customize the response - onError(error, context), default will throw
  onError?: (error, context) => any;
  //DEPRECATED If enabled, don't parse GET, HEAD, DELETE requests, default true
  strict?: boolean;
  //Declares the HTTP methods where bodies will be parsed, default ['POST', 'PUT', 'PATCH']. Replaces strict option.
  parsedMethods?: string[];
}

export interface AmalaOptions {
  // For If you want to supply your own koa application instance.
  // If this is not provided, amala will create a koa application for you.
  // Either way, an app is returned within the result of running the bootstrap function.
  app?: Application;

  // For if you want to supply tour own Koa-Router instance.
  // If this is not provided, amala will create a koa-router for you and load it up with endpoints
  // Either way, a router is returned within the result of running the bootstrap function.
  // The router is not attached by default to the app. If you want that, be sure to set options.attachRoutes to true.
  router?: any;

  // An array used to register all controllers to be routed. Can take Classes or glob path strings of where the classes exist.
  // It is recommended to statically register each controller Classes here instead of using path strings.
  controllers: Array<string | Function>;

  // Your base API path. default:  "/api"
  basePath?: string;

  // The versions you want to actively run for your API.
  // Default is [1] which means /api/v1/*. See docs for details.
  versions?: Array<number | string> | { [key: string]: string | boolean };

  // Set this to true to disable versioning. E.g /api/v1/* becomes /api/*
  disableVersioning?: boolean;

  // Define the sequence of middleware to per request.
  flow?: Array<(ctx, next) => Promise<void>>;

  /*
   Amala simplifies error handling for you using Boom errors.
   You can throw boom errors from within your endpoints and middleware and the will be nicely handled and
   sent back to the requester based on status code.

   If you must change this, be sure to reference the default implementation for context. See below:

   ```
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
   ```
   */
  errorHandler?: (err, ctx) => Promise<void>;

  // if true, will attach generated routes to the koa app. Don't set to true if you need to use app.use(...)
  attachRoutes?: boolean;

  // Options for class-validator. Used to validate endpoint injectables. See docs.
  validatorOptions?: ValidatorOptions;

  //EXPERIMENTAL / INCOMPLETE: enables openAPI through the path defined in options.openApiPath (default: /api/docs )
  enableOpenApi?: boolean;

  // open API path. Default: /api/docs
  openApiPath?: string;

  // A place to define general information about your openAPI export
  openApiInfo?: {
    title: string;
    version: string;
  };

  // body parser options. See https://www.npmjs.com/package/koa-body#options
  // Set to false to prevent amala from attaching koa-body middleware to all endpoints.
  // Useful if you prefer to use something else for body parsing in your koa app or to disable it altogether.
  bodyParser?: false | KoaBodyOptions;

  /**
   * Logs more processed for diagnostics.
   */
  diagnostics?: boolean;
}

export let options: AmalaOptions;
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
  params: AmalaOptions
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
      importClassesFromDirectories(controllerDef); //this is a string glob path. Load controllers from path
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

    if (options.openApiInfo) {
      openApiSpec.info = options.openApiInfo;
    }

    options.router.get(options.openApiPath, (ctx) => {
      ctx.body = openApiSpec;
    });
  }

  //body parser
  if (options.bodyParser !== false) {
    app.use(bodyParser({...options.bodyParser as KoaBodyOptions,
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