---
sidebar_position: 2
sidebar_label: Decorators
---

Here are the decorators you can use to define your API.

## Class Decorators

These decorators can be used on Classes i.e controllers

### @Controller(basePath?)

Specifies this class as a controller class i.e a container of controller endpoints.
`basepath` is prefixed to all endpoint paths within this class.

### @Flow([...middlewares])

Flow is the Amala terminology for "middleware chain".
Define the series of koa middleware that must run (and not throw an error) before any endpoint in this class can satisfy the request.

## Endpoint Decorators

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

These decorators are used to inject contextual request data into your controller endpoint's arguments.
Try to be as specific as possible with what you inject so that your endpoint handlers can be more easily tested.

### \@Body() or \@Body(options) or \@Body(name)

Injects ctx.request.body or ctx.request.body[name]

### @State() or @State(name)

Injects ctx.state object or ctx.state[name]

### @CurrentUser()

This is a shortcut to access `ctx.state.user`.
That is the standard location for storing the currently logged in user object. e.g when using koa-passport.
Consider using this along with an authentication guard middleware e.g

```typescript
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

### @File()

Injects the request files object. All files uploaded during the request can be found here, indexed by file field name.


### @Ctx()

Injects the whole koa context. For a more descriptive endpoint handler/endpoint, avoid doing this if you can. Opt for more specific injections.

## How to programmatically access controller endpoints

```typescript
import { getControllers } from "amala";
const codex: Record<string,Controller> = getControllers(); //codex is now an index of all the controller functions and their classes.
```

To access the controller with the class name `UserController`, you can use `codex.UserController` or `codex['UserController']`.
Because amala has you defining your endpoints using the equivalent of async service endpoints, you could essentially run these async service endpoints directly e.g

Given the endpoint definition:
```typescript
@Controller('/user')
class UserController {
    ...
    @Post('/')
    async createUser(@Body() userParams: UserParams){
        // create and return some new user
    }
    ...
}
```
You could directly run the function that the endpoint path `POST /api/v1/user` also runs by simply:
`const newUser = await codex.userController.createUser(userParams)` assuming the function doesn't require any koa context specific parameters.

This becomes somewhat of a useful and clean way to unit-test your endpoint functions.

## How to make custom decorators

Making custom decorators is easy! Just create a wrapper function around the Ctx decorator or any other decorator and you are done.
Decorators are currently limited to simply referencing fields from koa's ctx.

E.g If we wanted to pull something that some middleware has attached to ctx, we can simply say
```typescript
export const Something = ()=>Ctx('something');

```
and then use that in a controller
```typescript
    @Get('/')
    async myEndpointHandler(@Something() theThing: any) {
      // theThing lives
    }
```
