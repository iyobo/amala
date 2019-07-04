#koa-ts-controllers

This is a Typescript routing controller system for KoaJS 2+.
Define your REST API endpoints using classes and decorators.

```
--- main.ts

import {bootstrapControllers} from 'koa-ts-controllers';
const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

...

await bootstrapControllers(app, router, {
    basePath: '/api',
    controllers: [__dirname + '/controllers/**/*.ts']
});

...
```

```
--- constrollers/FooController.ts

import {Controller, Ctx, Req, Body, Get, Post, Delete} from 'koa-ts-controllers';
import {authMiddleware, aMiddleware, bMiddleware} from './yourMiddlewares'

@Controller('/foo')
export class FooController {

    @Get('/hello')
    async simpleGet() {
        // GET /api/v1/foo/hello
        return 'world';
    }

    @Get('/hello')
    @Version('2') 
    async simpleGet() {
        // GET /api/v2/foo/hello  
        // only if bootstrap options.version array contains '2', othewise 404.

        return 'world v2';
    }

    @Get('/:id')
    async getFooById( @Params('id') id: string) {
        // GET /api/v1/foo/123
            // id will be 123
        
        //id has been injected with the id
    }

    @Post('/')
    @Flow([authMiddleware])
    async createFoo( @Body() body: any) {

        // POST /api/v1/foo

        // body injected with post data   

        return body;
    }

    @Delete('/:id')
    @Flow([aMiddleware, bMiddleware])
    async deleteFoo(@Params() params: any) {
        // DELETE /api/v1/foo/123
            // params.id will be 123

        // ctx injected with the whole context. 
        // Better to be more specific about what you would like to inject 
        // as params to make your controllers easier to reason about.   

    }
}

```

Koa-ts-controllers is more native to Koa than other typescript controller systems (e.g routing-controllers) as it does not aim to be an abstraction layer for other API frameworks. 

All it cares about is KoaJS.

The result is more dependable behavior and better error handling e.g you can now throw `boom` errors in your controller 
actions (or from anywhere down the execution stack of said actions) and those errors will make it back to the client 
with exact status codes.

Also, Koa-ts-controllers supports **API versioning**. You won't find that anywhere else in a hurry.

This library is used heavily in [JollofStack](https://github.com/iyobo/jollofstack) (WIP), which is the typescript-centered re-architecture of [JollofJS](https://github.com/iyobo/jollofjs).

## Docs
### bootstrapControllers(app, router,  options)

Call this in your main file to initialize your controllers.

`app` is an instance of Koa.
`router` is an instance of Koa-router.
`options` is an object of type
```$xslt
{
    controllers: Array<string>; // glob to load all controllers e.g [__dirname + '/controllers/**/*.ts']
    basePath?: string; // prefix for API
    versions?: Array<number | string>; // The active versions of this API. default [1]. Most recent version of api should always be the last.
}
```

## Class Decorators
These decorators can be used on Classes i.e controllers

#### @Controller(basePath?)
Specifies this class as a controller class i.e a container of controller actions.
`basepath` is prefixed to all action paths within this class.

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
specify that this route handler only handles version `v` paths. And only if bootstrap options.version array contains `v`, otherwise 404.
### @Flow([...middlewares])
Flow is JollofJS terminology for "middleware chain". 
Define the series of middleware that must run (and not throw an error) before this function can satisfy the enpoint. See above example.

## Argument Decorators
These decorators are used to inject contextual request data into your controller action's arguments. 
Try to be as specific as possible with what you inject so that your endpoint handlers can be more easily tested.

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
Injects ctx.session object or ctx.session[name]
### @Req()
Injects the koa request object
### @Res
Injects the koa response object. useful when streaming data down to client.

### @Ctx()
Injects the whole koa context. Avoid doing this if you can. Opt for more specific injections.

