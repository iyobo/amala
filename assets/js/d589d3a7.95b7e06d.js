"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[162],{6443:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>l,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>s,toc:()=>d});var t=o(5893),r=o(1151);const a={sidebar_position:2,sidebar_label:"Getting started"},i="Getting started",s={id:"getting-started",title:"Getting started",description:"You may create an Amala project with any of the following:",source:"@site/docs/getting-started.md",sourceDirName:".",slug:"/getting-started",permalink:"/docs/getting-started",draft:!1,unlisted:!1,editUrl:"https://github.com/iyobo/amala/tree/master/docs/docs/getting-started.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2,sidebar_label:"Getting started"},sidebar:"tutorialSidebar",previous:{title:"Introduction",permalink:"/docs/intro"},next:{title:"API Spec",permalink:"/docs/category/api-spec"}},l={},d=[{value:"Alternatively",id:"alternatively",level:4},{value:"Bootstrapping the API",id:"bootstrapping-the-api",level:2},{value:"API Versioning",id:"api-versioning",level:3},{value:"Defining Controllers",id:"defining-controllers",level:2}];function c(e){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"getting-started",children:"Getting started"}),"\n",(0,t.jsx)(n.p,{children:"You may create an Amala project with any of the following:"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:(0,t.jsx)(n.code,{children:"npm init amala-app <project_name>"})}),"\n",(0,t.jsx)(n.li,{children:(0,t.jsx)(n.code,{children:"npm create amala-app <project_name>"})}),"\n",(0,t.jsx)(n.li,{children:(0,t.jsx)(n.code,{children:"yarn create amala-app <project_name>"})}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"Any of those will create a docker-ready project for you to expand upon.\nHappy"}),"\n",(0,t.jsx)(n.h4,{id:"alternatively",children:"Alternatively"}),"\n",(0,t.jsx)(n.p,{children:"You can also just install amala:"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"yarn add amala"}),"\nor\n",(0,t.jsx)(n.code,{children:"npm i amala"})]}),"\n",(0,t.jsx)(n.p,{children:"And manually replicate the next section."}),"\n",(0,t.jsx)(n.h2,{id:"bootstrapping-the-api",children:"Bootstrapping the API"}),"\n",(0,t.jsx)(n.p,{children:"Here is what the root of AmalaJS app looks like."}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-typescript",children:"---main.ts\n\nimport {bootstrapControllers} from 'amala';\nimport AController from './controllers/AController';\nimport BController from './controllers/BController';\n\n...\n\nconst {app, router} = await bootstrapControllers({\n    basePath: '/api',\n    controllers: [\n      AController,\n      BController\n    ], \n    versions:{\n        1: 'This version is deprecated and will soon be removed. Consider migrating to version 2 ASAP', // see Version decorator doc below\n        2: true,\n      dangote: true // great for custom, business client specific endpoint versions\n    },\n    useHelmet: true, // standard security protections for servers.\n    openAPi: {\n        enabled: true // default is \"/api/docs\" for Openapi JSON output and \"/api/swagger\" for Swagger UI.\n    }\n});\n\n\n\n// or bootstrapOptions.attachRoutes = true\napp.use(router.routes());\napp.use(router.allowedMethods());\n\n...\napp.start(3000)\n"})}),"\n",(0,t.jsxs)(n.p,{children:["Let's unpack some things here.\nIt all begins from the ",(0,t.jsx)(n.code,{children:"bootstrapControllers"})," function."]}),"\n",(0,t.jsxs)(n.p,{children:["The bootstrap function will return an object containing a Koa instance ",(0,t.jsx)(n.code,{children:"app"})," and a Koa-Router instance ",(0,t.jsx)(n.code,{children:"router"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["The ",(0,t.jsx)(n.code,{children:"controllers"})," array option is required and can include actual Controller classes (preferred) or glut strings describing where controller classes exist.\nThough this library allows gluts, it is generally better for typescript that the Class objects are declaratively referenced in the array as is done with ",(0,t.jsx)(n.code,{children:"MyOtherController"}),". This is to avoid any issues that might arise regarding JS vs TS files."]}),"\n",(0,t.jsxs)(n.p,{children:["You definitely want to attach the router to the app as shown above before you start the app.\nThe reason we leave that to you is just in case you want to do other things and add other middleware before your routes.\nIf you want to truly use the amala bootstrap function for everything, you can use the ",(0,t.jsx)(n.code,{children:"flow"})," (array/order of middleware executed per request) and ",(0,t.jsx)(n.code,{children:"attachRoutes"}),"(boolean) options (See below)."]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-typescript",children:"const koaApp = new Koa();\nconst koarouter = new KoaRouter();\nimport someOtherMiddleware from './someOtherMiddleware'\n\nconst someMiddleware = (ctx, next)=>{\n    ctx.state.foo = \"bar\";\n    next();\n}\n\nconst {app, router} = await bootstrapControllers({\n  app: koaApp,\n  router: koarouter,\n  basePath: '/api',\n  flow: [someMiddlewareFunction, someOtherMiddleware], // in order of execution!\n  attachRoutes: true,\n  ...\n});\n\n\n"})}),"\n",(0,t.jsx)(n.p,{children:"As seen above, You could also optionally bring your own koa app instance or koa-router instance and put that into the bootstrap options,\nbut the goal of Amala is to get you up and running as quickly and simply as possible."}),"\n",(0,t.jsxs)(n.p,{children:["Either way, the ",(0,t.jsx)(n.code,{children:"bootstrapControllers"})," function will always return the bare minimum you need (app, router) to get your Koa API running."]}),"\n",(0,t.jsx)(n.h3,{id:"api-versioning",children:"API Versioning"}),"\n",(0,t.jsxs)(n.p,{children:["Amala supports ",(0,t.jsx)(n.strong,{children:"API versioning"})," by default. It's a rather rare feature. You can also disable versioning if you don't need it."]}),"\n",(0,t.jsxs)(n.p,{children:["API versioning is enabled by default with Amala i.e ",(0,t.jsx)(n.code,{children:"/api/v1/controller/endpoint"}),"\nThe ",(0,t.jsx)(n.code,{children:"versions"})," config option is an array of active versions for your API. Default is ",(0,t.jsx)(n.code,{children:"versions: [1]"}),", which puts all endpoints under /api/v1/...."]}),"\n",(0,t.jsxs)(n.p,{children:["To disable versioning, simple set the config option ",(0,t.jsx)(n.code,{children:"disableVersioning"})," to ",(0,t.jsx)(n.code,{children:"true"})," in bootstrapControllers. This will change the more common route structure ",(0,t.jsx)(n.code,{children:"/api/controller/endpoint"})]}),"\n",(0,t.jsx)(n.p,{children:"Also see examples below for working with multiple versions of your API in your controller definition."}),"\n",(0,t.jsx)(n.h2,{id:"defining-controllers",children:"Defining Controllers"}),"\n",(0,t.jsx)(n.p,{children:"Below is an example of a controller class, displaying many endpoint scenarios:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-typescript",children:"--- controllers/FooController.ts\n\nimport {Controller, Ctx, Req, Body, Get, Post, Delete, Query, Flow, Params, Version} from 'amala';\nimport {authMiddleware, aMiddleware, bMiddleware} from './yourMiddlewares'\nimport {IsNumber, IsString} from 'class-validator';\n\n@Controller('/foo')\n@Flow(aMiddleware) // middleware to pass into any of the endpoints in this controller. e.g auth middleware.\nexport class FooController {\n\n    @Get('/')\n    async myEndpointHandler() {\n        // GET /api/v1/foo OR /api/v2/foo OR /api/vdangote/foo\n\n        return 'Beans and garri makes sense';\n    }\n\n    @Get('/hello')\n    @Version('1')\n    async simpleGetV1() {\n        // GET /api/v1/foo/hello... only!\n        // This is a versioned endpoint handler, so it will only handle a specific version of a\n        // particular route.\n        // Also, because v1 was specified with a warning message, there will be a 'Deprecated' header with that message.\n\n\n        return 'world v1';\n    }\n\n    @Get('/hello')\n    async simpleGet() {\n        // GET /api/v2/foo/hello OR /api/vdangote/foo/hello\n        // This is a catch-remaining-versions endpoint for the 'hello' route . It will handle any\n        // remaining undefined versions of previously versioned endpoint[s].\n        // The positioning of the catch-remaining-versions endpoint is key. it needs to be defined last.\n\n        return 'Hello earthlings';\n    }\n\n    @Get(['hello/john', 'hello/rick'])\n    async multiGet() {\n        // GET /api/v.../foo/hello/john OR /api/v.../foo/hello/rick\n\n        return 'Hello Gentlemen';\n    }\n\n\n    @Get('/model/:id')\n    async getModelById( @Params('id') id: string) {\n        // GET /api/v.../foo/model/123\n        // The function argument id has been injected with ctx.params.id, which is the string \"123\"\n    }\n\n    @Get('/model/:idnum')\n    async getFooById( @Params('idnum') id: number) {\n        // GET /api/v.../foo/123\n        // The function argument id has been injected with ctx.params.id, which has been casted into the number 123\n    }\n\n    @Get('/incidents/:region')\n    async getIncidentsByRegion(\n        @Params('region') region: string,\n        @Query('from') fromTimestamp: number ) {\n\n        // GET /api/v.../foo/incidents/austintx?from=123456\n\n        // region === 'austintx' && fromTimestamp === 123456\n    }\n\n    @Post('/lead')\n    @Flow([authMiddleware])\n    async createFoo( @Body() leadData: any) {\n\n        // POST /api/v.../lead\n        // leadData injected with all POST data\n \n        //maybe store it...\n\n    }\n\n    @Post('/lead')\n    @Flow([authMiddleware])\n    async createFooForAuthenticatedUser( @Body() leadData: any, @CurrentUser() user) {\n    \n        leadData.creatorId = user.id\n\n        //store it...\n    \n    }\n\n\n    @Post('/specific')\n    async createFooSpecific( @Body('foo') fooParam: string) {\n\n        // POST /api/v.../foo/specific\n\n        // fooParam argument injected with particular field body.foo\n\n        return fooParam;\n    }\n    @Post('/specific2')\n    async createFooSpecific2( @Body({field: 'foo'}) fooParam: string) {\n\n        // POST /api/v.../foo/specific2\n\n        // Same as before. fooParam argument injected with particular field body.foo\n\n        return fooParam;\n    }\n\n    @Post('/orDie')\n    async createFooRequired( @Body({required: true}) body: any) {\n\n        // POST /api/v.../foo/orDie\n\n        // body will throw 422 error if no body input given\n\n        return body;\n    }\n\n    @Post('/orDie2')\n    async createFooRequired2( @Body({required: true}) body: FooCreateInput) {\n\n        // POST /api/v.../foo/orDie2\n\n        // providing a class as a type to an object-level argument\n        // (i.e not a primitive) means you want\n        // that object to be validated by that class-validator class.\n        // See definition of FooCreateInput validation class below.\n\n        return body;\n    }\n\n  @Post('/fieldsAndFiles')\n  async createWithFiles( \n    @Body({required: true}) body: FooCreateInput, \n    @File() files: Record<string,File>) {\n\n    // POST /api/v.../foo/orDie2\n\n    // Any file uploaded will appear in files, indexed by the name of the file.\n    \n    return body;\n  }\n\n\n    @Delete('/:id')\n    @Flow([aMiddleware, bMiddleware])\n    async deleteFoo(@Params() params: any) {\n        // DELETE /api/v.../foo/123\n            // params.id will be 123\n\n    }\n\n    @Delete('/specific/:id')\n    @Flow([aMiddleware, bMiddleware])\n    async deleteFooSpecific(@Params('id') id: any) {\n        // DELETE /api/v.../foo/specific/123\n            // id will be 123\n\n    }\n}\n\n// Validator class.\nclass FooCreateInput {\n    @IsString()\n    aString: string;\n\n    @IsNumber()\n    aNumber: number;\n}\n\n"})}),"\n",(0,t.jsxs)(n.p,{children:["See tests in ",(0,t.jsx)(n.code,{children:"src/tests"})," for more detailed examples."]}),"\n",(0,t.jsx)(n.p,{children:"Amala is more native to Koa than other Typescript controller systems (e.g routing-controllers) as it does not aim to be an abstraction layer for other API frameworks."}),"\n",(0,t.jsx)(n.p,{children:"All it cares about is KoaJS."}),"\n",(0,t.jsxs)(n.p,{children:["The result is more dependable behavior and better error handling e.g you can now throw ",(0,t.jsx)(n.code,{children:"boom"})," errors in your controller\nendpoints (or from anywhere down the execution stack of said endpoints) and those errors will make it back to the client\nwith exact status codes."]})]})}function p(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},1151:(e,n,o)=>{o.d(n,{Z:()=>s,a:()=>i});var t=o(7294);const r={},a=t.createContext(r);function i(e){const n=t.useContext(a);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),t.createElement(a.Provider,{value:n},e.children)}}}]);