# Amala

**Amala** is a next-generation routing and controller system for KoaJS v2+ and Typescript.

- Define your REST API endpoints using ES8 _classes_ and _decorators_.
- Inject arguments into your endpoint handlers, effectively turning your controller actions into service actions.

This leads to clean, self-documenting API endpoints and makes it so you can re-use those service actions elsewhere.
It also makes your endpoint actions easier to test.

OpenAPI export feature is in progress and very incomplete, but you can see where it is by hitting 'GET /api/docs' by default.

## Supporting Amala

**Amala** is an MIT-licensed open source project with its ongoing development made possible entirely by
community support. If Amala is helping you build
awesome APIs, please consider <a href="https://www.patreon.com/bePatron?u=19661939" data-patreon-widget-type="become-patron-button">Becoming a Patron</a>.

If you would like to contribute in other ways, Pull requests are also welcome!


## How to Use

First you want to install amala:

`yarn add amala`
or
`npm i amala`

Now have a look at the usage below.
PLEASE NOTE: This project initially existed under the generic name `koa-ts-controllers`. It is now named `amala`.
No further updates will be made under `koa-ts-controllers`.
Please replace `koa-ts-controllers` with `amala` in your code base.

```typescript
---main.ts

import {bootstrapControllers} from 'amala';
import MyOtherController from './otherController/MyOtherController';


...

const {app, router} = await bootstrapControllers({
    basePath: '/api',
    controllers: [
      MyOtherController, 
      __dirname + '/controllers/**/*.ts' // It is recommended to add controller classes directly to this array, but you can also add glob strings
    ], 
    versions:{
        1: 'This version is deprecated and will soon be removed. Consider migrating to version 2 ASAP',
        2: true,
      dangote: true // great for custom, business client specific endpoint versions
    },
});



// or bootstrapOptions.attachRoutes = true
app.use(router.routes());
app.use(router.allowedMethods());

...
app.start(3000)
```

Let's unpack some things here.
It all begins from the `bootstrapControllers` function. 

The bootstrap function will return an object containing a Koa instance `app` and a Koa-Router instance `router`.

You could optionally bring your own koa app instance or koa-router instance and put that into the bootstrap options, 
but the goal of Amala is to get you up and running as quickly and simply as possible. 


```typescript

const {app, router} = await bootstrapControllers({
  app,
  router,
  basePath: '/api',
  controllers: [
    MyOtherController,
    __dirname + '/controllers/**/*.ts' // It is recommended to add controller classes directly to this array, but you can also add glob strings
  ],
  versions:{
    1: 'This version is deprecated and will soon be removed. Consider migrating to version 2 ASAP',
    2: true,
    dangote: true // great for custom, business client specific endpoint versions
  },
});

// ...

```

Either way, the `bootstrapControllers` function will always return the bare minimum you need (app, router) to get your Koa API running.

The `controllers` array option is required and can include actual Controller classes (preferred) or glut strings describing where controller classes exist.
Though this library allows gluts, it is generally better for typescript that the Class objects are declaratively referenced in the array as is done with `MyOtherController`. This is to avoid any issues that might arise regarding JS vs TS files.

You definitely want to attach the router to the app as shown above before you start the app.
The reason we leave that to you is so just in case you want to do add other middleware before your routes.
If you want to truly use the bootstrap function for everything, you can use the `flow` (array of middleware) and `attachRoutes`(boolean) options.


Below is an example of a controller class, displaying many endpoint scenarios:

```typescript
--- controllers/FooController.ts

import {Controller, Ctx, Req, Body, Get, Post, Delete, Query, Flow, Params, Version} from 'amala';
import {authMiddleware, aMiddleware, bMiddleware} from './yourMiddlewares'
import {IsNumber, IsString} from 'class-validator';

@Controller('/foo')
@Flow(aMiddleware) // middleware to pass into any of the endpoints in this controller. e.g auth middleware.
export class FooController {

    @Get('/')
    async myEndpointHandler() {
        // GET /api/v1/foo OR /api/v2/foo OR /api/vdangote/foo

        return 'Beans and garri makes sense';
    }

    @Get('/hello')
    @Version('1')
    async simpleGetV1() {
        // GET /api/v1/foo/hello... only!
        // This is a versioned endpoint handler, so it will only handle a specific version of a
        // particular route.
        // Also, because v1 was specified with a warning message, there will be a 'Deprecated' header with that message.


        return 'world v1';
    }

    @Get('/hello')
    async simpleGet() {
        // GET /api/v2/foo/hello OR /api/vdangote/foo/hello
        // This is a catch-remaining-versions endpoint for the 'hello' route . It will handle any
        // remaining undefined versions of previously versioned endpoint[s].
        // The positioning of the catch-remaining-versions endpoint is key. it needs to be defined last.

        return 'Hello earthlings';
    }

    @Get(['hello/john', 'hello/rick'])
    async multiGet() {
        // GET /api/v.../foo/john OR /api/v.../foo/rick

        return 'Hello Gentlemen';
    }


    @Get('/model/:id')
    async getFooById( @Params('id') id: string) {
        // GET /api/v.../foo/model/123
        // The function argument id has been injected with ctx.params.id, which is the string "123"
    }

    @Get('/model/:idnum')
    async getFooById( @Params('idnum') id: number) {
        // GET /api/v.../foo/123
        // The function argument id has been injected with ctx.params.id, which has been casted into the number 123
    }

    @Get('/incidents/:region')
    async getFooById(
        @Params('region') region: string,
        @Query('from') fromTimestamp: number ) {

        // GET /api/v.../incidents/austintx?from=123456

        // region === 'austintx' && fromTimestamp === 123456
    }

    @Post('/lead')
    @Flow([authMiddleware])
    async createFoo( @Body() leadData: any) {

        // POST /api/v.../lead
        // leadData injected with all POST data
 
        //store it...

    }

    @Post('/lead')
    @Flow([authMiddleware])
    async createFooForAuthenticatedUser( @Body() leadData: any, @CurrentUser() user) {
    
        leadData.creatorId = user.id

        //store it...
    
    }


    @Post('/specific')
    async createFooSpecific( @Body('foo') fooParam: string) {

        // POST /api/v.../foo/specific

        // fooParam argument injected with particular field body.foo

        return fooParam;
    }
    @Post('/specific2')
    async createFooSpecific2( @Body({field: 'foo'}) fooParam: string) {

        // POST /api/v.../foo/specific2

        // Same as before. fooParam argument injected with particular field body.foo

        return fooParam;
    }

    @Post('/orDie')
    async createFooRequired( @Body({required: true}) body: any) {

        // POST /api/v.../foo/orDie

        // body will throw 422 error if no body input given

        return body;
    }

    @Post('/orDie2')
    async createFooRequired2( @Body({required: true}) body: FooCreateInput) {

        // POST /api/v.../foo/orDie2

        // providing a class as a type to an object-level argument
        // (i.e not a primitive) means you want
        // that object to be validated by that class-validator class.
        // See definition of FooCreateInput validation class below.

        return body;
    }


    @Delete('/:id')
    @Flow([aMiddleware, bMiddleware])
    async deleteFoo(@Params() params: any) {
        // DELETE /api/v.../foo/123
            // params.id will be 123

    }

    @Delete('/specific/:id')
    @Flow([aMiddleware, bMiddleware])
    async deleteFooSpecific(@Params('id') id: any) {
        // DELETE /api/v.../foo/specific/123
            // id will be 123

    }
}

// Validator class.
class FooCreateInput {
    @IsString()
    aString: string;

    @IsNumber()
    aNumber: number;
}

```

See tests in `src/tests` for more detailed examples.

Amala is more native to Koa than other Typescript controller systems (e.g routing-controllers) as it does not aim to be an abstraction layer for other API frameworks.

All it cares about is KoaJS.

The result is more dependable behavior and better error handling e.g you can now throw `boom` errors in your controller
actions (or from anywhere down the execution stack of said actions) and those errors will make it back to the client
with exact status codes.

Also, Amala supports **API versioning**. You won't find that anywhere else in a hurry.

This library is used heavily in [JollofStack](https://github.com/iyobo/jollofstack) (WIP), which is the typescript-centered re-architecture of [JollofJS](https://github.com/iyobo/jollofjs).

## Docs

### bootstrapControllers(options)

Call this in your main file to initialize your controllers.
#### Returns
`Promise<{ app: Application; router: Router }>`
Returns a promise of the koa app, and the router used in the bootstrap function.

```typescript

// bootstrap options
{
  app?: Application; // a koa application. It not provided, a koa app will be created.
  router ?: KoaRouter; // an instance of koa-router. if not supplied, will create and add its own router to app.
  controllers: Array<string>; // glob to load all controllers e.g [__dirname + '/controllers/**/*.ts']
  basePath ?: string; // prefix for API URI

  // default: {1: true} The active versions of this API. default is {'1': true} meaning all routes will take
  // the form /base/v1/controller/action.
  versions ?: Array<number | string> | object;

  // default: false. Set to true to prevent your API from enjoying versioning. i.e path: /api/controller/action.
  // Not recommended unless you wish to handle versioning manually in each controller's basePath.
  disableVersioning ?: boolean

  // Default: true. Makes your boom errors better received downstream.
  boomifyErrors ?: boolean;

  // Default: false. If true, will attach the routes to your koa app for you automatically as opposed to doing it manually
  // app.use(router.routes());
  // app.use(router.allowedMethods());
  attachRoutes ?: boolean

  //Default: empty. Here you can set validation options for class-validator which is optionally used to validate endpoint arguments.
  // To see options, visit: https://github.com/typestack/class-validator#passing-options
  validationOptions ?: ValidatorOptions

  //openApi
  // Default: true
  enableOpenApi?: boolean;
  
  // What path to access the openAPI output
  //Default: /api/docs
  openApiPath?: string; 
  
  //Use this to specify your app's title and version that gets used when generating the openAPI spec
  openApiInfo?: {
    title: string,
    version: string
  }
  
  // middleware queue to run for each endpoint
  flow?: Array<(ctx, next: Function)=>Promise<void>>;
  
  // in case you wish to specify your own error handler.
  errorHandler?: Function;

  // body parser options
  bodyParserOptions?: any;
}
```

## Class Decorators

These decorators can be used on Classes i.e controllers

### @Controller(basePath?)

Specifies this class as a controller class i.e a container of controller actions.
`basepath` is prefixed to all action paths within this class.

### @Flow([...middlewares])

Flow is JollofJS terminology for "middleware chain".
Define the series of koa middleware that must run (and not throw an error) before any action in this class can satisfy the request.

## Action Decorators

These decorators wrap functions of controller classes.

### @Get(path)

Specifies a function as a handler to the given GET `path` route. See above examples.

### @Post(path)

Specifies a function as a handler to the given POST `path` route. See above examples.

### @Patch(path)

Specifies a function as a handler to the given PATCH `path` route. See above examples.

### @Put(path)

Specifies a function as a handler to the given PUT `path` route. See above examples.

### @Delete(path)

Specifies a function as a handler to the given DELETE `path` route. See above examples.

### @Version(v)

specify that this route handler only handles version `v` paths. And only if bootstrap options.version contains `v`, otherwise 404.

### @Flow([...middlewares])

Flow is JollofJS terminology for "middleware chain".
Define the series of middleware that must run (and not throw an error) before this function can satisfy the enpoint. See above example.

## Argument Decorators

These decorators are used to inject contextual request data into your controller action's arguments.
Try to be as specific as possible with what you inject so that your endpoint handlers can be more easily tested.

### @Body() or @Body({required}) or @Body(name)

Injects ctx.request.body or ctx.request.body[name]

### @State() or @State(name)

Injects ctx.state object or ctx.state[name]

### @CurrentUser()

This is a shortcut to access `ctx.state.user`.
That is the standard location for storing the currently logged in user object. e.g when using koa-passport.
Consider using this along with an authentication guard middleware e.g 

```
@Post('/lead')
@Flow([authMiddleware])
async createFoo( @Body() leadData: any, @CurrentUser() user) {

    leadData.userId = user.id
    return leadData;
}

```

### @Header() or @Header(name)

Injects ctx.header object or ctx.header[name]

### @Params() or @Params(name)

Injects ctx.params object or ctx.params[name]

### @Query() or @Query(name)

Injects ctx.query object or ctx.query[name]

### @Session() or @Session(name)

This works only if you have a session handler defined in ctx.session e.g koa-session.
Injects ctx.session object or ctx.session[name]

### @Req()

Injects the koa request object. useful when streaming data up to server

### @Res()

Injects the koa response object. useful when streaming data down to client.

### @Ctx()

Injects the whole koa context. For a more descriptive endpoint handler/action, avoid doing this if you can. Opt for more specific injections.

# How to programmatically access controller actions

```typescript
import { getControllers } from "amala";
const codex = getControllers(); //codex is now an index of all the controller functions and their classes.
```

# Upcoming Features

- Support for Open API 3
  - Amala will soon be able to generate Open API 3 specs (JSON) based on your controller definitions.

# Troubleshooting

- If you get TS errors like

```
node_modules/class-validator/decorator/decorators.d.ts:161:45 - error TS2503: Cannot find namespace 'ValidatorJS'.
161 export declare function IsDecimal(options?: ValidatorJS.IsDecimalOptions, validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
```

(e.g if using `sequelize-typescript`),  
Then this means you are likely experiencing dependency clashes.
We recommend using yarn for much improved dependency resolution or, if you must use npm, consider adding the following to your `tsconfig.json`:

`"typeRoots": ["./node_modules/*/node_modules/@types/"]`
