# koa-ts-controllers

This is a Typescript routing controller system for KoaJS 2+.
Define your REST API endpoints using classes and decorators.
Inject arguments into your endpoint handlers, effectively turning your controller actions into service actions.

This leads to clean, self-documenting API endpoints and makes it so you can re-use those service actions elsewhere. It also makes them easier to test.

`npm i koa-ts-controllers`

```
--- main.ts

import {bootstrapControllers} from 'koa-ts-controllers';
const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

...

await bootstrapControllers(app, {
    router,
    basePath: '/api',
    controllers: [__dirname + '/controllers/**/*.ts'],
    initBodyParser: true,
    boomifyErrors: true,
    versions:{
        1: 'This version is deprecated and will soon be removed. Consider migrating to version 2 ASAP',
        2: true,
        dangote: true // great for custom, business client specific endpoint versions
    }
});

...
```

```
--- constrollers/FooController.ts

import {Controller, Ctx, Req, Body, Get, Post, Delete, IsString, IsNumber} from 'koa-ts-controllers';
import {authMiddleware, aMiddleware, bMiddleware} from './yourMiddlewares'

@Controller('/foo')
@Flow(aMiddleware) // middleware to pass into any of the endpoints in this controller. e.g auth middleware.
export class FooController {

    @Get('/')
    async myEndpointHandler() {
        // GET /api/v1/foo OR /api/v2/foo OR /api/vdangote/foo
        
        return 'Beans and garri makes sense';
    }

    @Get('/hello')
    @version('1') 
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
        // This is a catch-remaining-versions endpoint for this route. It will handle any 
        // remaining undefined versions of previously versioned endpoint[s]. 
        // The positioning of the catch-remaining-versions endpoint is key. it needs to be defined last.
        
        return 'world';
    }

    @Get('/:id')
    async getFooById( @Params('id') id: string) {
        // GET /api/v.../foo/123
            // id will be "123"
        
        //id has been injected with the string id
    }
    
    @Get('/:idnum')
    async getFooById( @Params('idnum') id: number) {
        // GET /api/v.../foo/123
            // id will be 123
        
        //id has been injected with the number id
    }

    @Post('/')
    @Flow([authMiddleware])
    async createFoo( @Body() body: any) {

        // POST /api/v.../foo

        // body injected with post data   

        return body;
    }
    
    @Post('/specific')
    async createFooSpecific( @Body('foo') fooParam: string) {

        // POST /api/v.../foo/specific

        // fooParam argument injected with particular field body.foo 

        return fooParam;
    }
    @Post('/specific2')
    async createFooSpecific2( @Body({field: 'foo}) fooParam: string) {

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

        // providing a class as an type to an object-level argument 
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

// Validator class, internally using class-validator library. 
// Make sure to use the validator decorators exported directly from 'koa-ts-controllers'
// See the class-validator module docs for details.
class FooCreateInput {
    @IsString()
    aString: string;

    @IsNumber()
    aNumber: number;
}

```

Koa-ts-controllers is more native to Koa than other Typescript controller systems (e.g routing-controllers) as it does not aim to be an abstraction layer for other API frameworks. 

All it cares about is KoaJS.

The result is more dependable behavior and better error handling e.g you can now throw `boom` errors in your controller 
actions (or from anywhere down the execution stack of said actions) and those errors will make it back to the client 
with exact status codes.

Also, Koa-ts-controllers supports **API versioning**. You won't find that anywhere else in a hurry.

This library is used heavily in [JollofStack](https://github.com/iyobo/jollofstack) (WIP), which is the typescript-centered re-architecture of [JollofJS](https://github.com/iyobo/jollofjs).

## Docs
### bootstrapControllers(app,  options)

Call this in your main file to initialize your controllers.

`app` is an instance of Koa.
`options` is an object of type
```$xslt
{
    router?: KoaRouter; // an instance of koa-router. if not supplied, will create and add its own router to app.
    controllers: Array<string>; // glob to load all controllers e.g [__dirname + '/controllers/**/*.ts']
    basePath?: string; // prefix for API URI
    
    // default: {1: true} The active versions of this API. default is {'1': true} meaning all routes will take 
    the form /base/v1/controller/action.
    versions?: Array<number | string> | object; 
    
    // default: false. Set to true to prevent your API from enjoying versioning. i.e path: /api/controller/action. 
    // Not recommended unless you wish to handle versioning manually in each controller's basePath.
    disableVersioning?: boolean  
    
    // Default: false. set to true to attach a default koa-body middleware to your koa app. 
    // If you leave this as false, you must ensure you are attaching a body parser to your koa app somewhere before 
    // bootstrapserver is called.
    initBodyParser?: boolean; 
    
    // Default: true. Makes your boom errors better received downstream.
    boomifyErrors?: boolean; 
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

### @Header() or @Header(name)
Injects ctx.header object or ctx.header[name]

### @Cookie() or @Cookie(name)
Injects ctx.cookies object or ctx.cookies[name]

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
```
import {getControllers} from 'koa-ts-controllers`
const codex = getControllers(); //codex is now an index of all the controller functions and theor classes.
```
# Upcoming Features
- Support for Open API 3
    - Koa-TS-Controllers will soon be able to generate Open API 3 spec files (JSON) based on your controller definitions.
    
