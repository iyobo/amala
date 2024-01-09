---
sidebar_position: 2
sidebar_label: Getting started
---

# Getting started

You may create an Amala project with any of the following:
- `npm init amala-app <project_name>`
- `npm create amala-app <project_name>`
- `yarn create amala-app <project_name>`

Any of those will create a docker-ready project for you to expand upon.
Happy

#### Alternatively

You can also just install amala:

`yarn add amala`
or
`npm i amala`

And manually replicate the next section.


## Bootstrapping the API

Here is what the root of AmalaJS app looks like.

```typescript
---main.ts

import {bootstrapControllers} from 'amala';
import AController from './controllers/AController';
import BController from './controllers/BController';

...

const {app, router} = await bootstrapControllers({
    basePath: '/api',
    controllers: [
      AController,
      BController
    ], 
    versions:{
        1: 'This version is deprecated and will soon be removed. Consider migrating to version 2 ASAP', // see Version decorator doc below
        2: true,
      dangote: true // great for custom, business client specific endpoint versions
    },
    useHelmet: true, // standard security protections for servers.
    openAPi: {
        enabled: true // default is "/api/docs" for Openapi JSON output and "/api/swagger" for Swagger UI.
    }
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

The `controllers` array option is required and can include actual Controller classes (preferred) or glut strings describing where controller classes exist.
Though this library allows gluts, it is generally better for typescript that the Class objects are declaratively referenced in the array as is done with `MyOtherController`. This is to avoid any issues that might arise regarding JS vs TS files.

You definitely want to attach the router to the app as shown above before you start the app.
The reason we leave that to you is just in case you want to do other things and add other middleware before your routes.
If you want to truly use the amala bootstrap function for everything, you can use the `flow` (array/order of middleware executed per request) and `attachRoutes`(boolean) options (See below).


```typescript
const koaApp = new Koa();
const koarouter = new KoaRouter();
import someOtherMiddleware from './someOtherMiddleware'

const someMiddleware = (ctx, next)=>{
    ctx.state.foo = "bar";
    next();
}

const {app, router} = await bootstrapControllers({
  app: koaApp,
  router: koarouter,
  basePath: '/api',
  flow: [someMiddlewareFunction, someOtherMiddleware], // in order of execution!
  attachRoutes: true,
  ...
});


```

As seen above, You could also optionally bring your own koa app instance or koa-router instance and put that into the bootstrap options,
but the goal of Amala is to get you up and running as quickly and simply as possible.

Either way, the `bootstrapControllers` function will always return the bare minimum you need (app, router) to get your Koa API running.

### API Versioning

Amala supports **API versioning** by default. It's a rather rare feature. You can also disable versioning if you don't need it.

API versioning is enabled by default with Amala i.e `/api/v1/controller/endpoint`
The `versions` config option is an array of active versions for your API. Default is `versions: [1]`, which puts all endpoints under /api/v1/....

To disable versioning, simple set the config option `disableVersioning` to `true` in bootstrapControllers. This will change the more common route structure `/api/controller/endpoint`

Also see examples below for working with multiple versions of your API in your controller definition.

## Defining Controllers

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
        // GET /api/v.../foo/hello/john OR /api/v.../foo/hello/rick

        return 'Hello Gentlemen';
    }


    @Get('/model/:id')
    async getModelById( @Params('id') id: string) {
        // GET /api/v.../foo/model/123
        // The function argument id has been injected with ctx.params.id, which is the string "123"
    }

    @Get('/model/:idnum')
    async getFooById( @Params('idnum') id: number) {
        // GET /api/v.../foo/123
        // The function argument id has been injected with ctx.params.id, which has been casted into the number 123
    }

    @Get('/incidents/:region')
    async getIncidentsByRegion(
        @Params('region') region: string,
        @Query('from') fromTimestamp: number ) {

        // GET /api/v.../foo/incidents/austintx?from=123456

        // region === 'austintx' && fromTimestamp === 123456
    }

    @Post('/lead')
    @Flow([authMiddleware])
    async createFoo( @Body() leadData: any) {

        // POST /api/v.../lead
        // leadData injected with all POST data
 
        //maybe store it...

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

  @Post('/fieldsAndFiles')
  async createWithFiles( 
    @Body({required: true}) body: FooCreateInput, 
    @File() files: Record<string,File>) {

    // POST /api/v.../foo/orDie2

    // Any file uploaded will appear in files, indexed by the name of the file.
    
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
endpoints (or from anywhere down the execution stack of said endpoints) and those errors will make it back to the client
with exact status codes.

