---
sidebar_position: 1
sidebar_label: bootstrapControllers
---

# bootstrapControllers(options)
Call this in your main file to initialize your controllers.
#### Returns
`Promise<{ app: Application; router: Router }>`
Returns a promise of the koa app, and the router used in the bootstrap function.

```typescript

// bootstrap options

export interface AmalaOptions {
  // For If you want to supply your own koa application instance.
  // If this is not provided, amala will create a koa application for you.
  // Either way, an app is returned from the bootstrap function.
  app?: Application;

  // For if you want to supply your own Koa-Router instance.
  // If this is not provided, amala will create a koa-router for you and load it up with endpoints
  // Either way, a router is returned from the bootstrap function.
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

  // default: false. Set this to true to disable versioning. E.g /api/v1/* becomes /api/*
  disableVersioning?: boolean;

  // Define the sequence of middleware to per request.
  flow?: Array<(ctx, next) => Promise<void>>;

  /*
   Amala simplifies error handling for you using Boom errors.
   You can throw boom errors from within your endpoints and middleware and the will be nicely handled and
   sent back to the requester based on status code.

   If you must change this, be sure to reference the default implementation for context. See below:

   
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
   
   */
  errorHandler?: (err, ctx) => Promise<void>;

  // if true, will attach generated routes to the koa app. Don't set to true if you need to use app.use(...)
  attachRoutes?: boolean;

  // Options for class-validator. Used to validate endpoint injectables. See docs.
  validatorOptions?: ValidatorOptions;

  
  openAPI?: {
    enabled: boolean;
    /**
     * URL path to serve openAPi spec. Default: "/api/docs"
     */
    specPath?: string,

    /**
     * URL path to serve openAPi UI. Default: "/api/swagger"
     */
    webPath?: string,

    /**
     * What is the public URL for this API?
     */
    publicURL: string,

    /**
     * Use this to Pre-fill certain aspects of the OpenAPI spec e.g to define "info" segment.
     */
    spec?: Partial<{
      info: Partial<OpenAPIV3_1.InfoObject>;
      servers?: OpenAPIV3_1.ServerObject[];
      paths: Partial<OpenAPIV3_1.PathsObject>;
      components?: Partial<OpenAPIV3_1.ComponentsObject>;
      security?: Partial<OpenAPIV3_1.SecurityRequirementObject>[];
      tags?: Partial<OpenAPIV3_1.TagObject[]>;
      externalDocs?: Partial<OpenAPIV3_1.ExternalDocumentationObject>;
    }>
  };


  // body parser options. See https://www.npmjs.com/package/koa-body#options
  // Set to false to prevent amala from attaching koa-body middleware to all endpoints.
  // Useful if you prefer to use something else for body parsing in your koa app or to disable it altogether.
  bodyParser?: false | KoaBodyOptions;
}

```