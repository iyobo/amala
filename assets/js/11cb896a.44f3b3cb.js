"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[627],{6117:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>l,contentTitle:()=>a,default:()=>h,frontMatter:()=>t,metadata:()=>i,toc:()=>c});var s=r(5893),o=r(1151);const t={sidebar_position:2,sidebar_label:"Decorators"},a=void 0,i={id:"api-spec/decorators",title:"decorators",description:"Here are the decorators you can use to define your API.",source:"@site/docs/api-spec/decorators.md",sourceDirName:"api-spec",slug:"/api-spec/decorators",permalink:"/docs/api-spec/decorators",draft:!1,unlisted:!1,editUrl:"https://github.com/iyobo/amala/tree/master/docs/docs/api-spec/decorators.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2,sidebar_label:"Decorators"},sidebar:"tutorialSidebar",previous:{title:"bootstrapControllers",permalink:"/docs/api-spec/bootstrap-controllers"},next:{title:"Upcoming Features",permalink:"/docs/upcoming-features"}},l={},c=[{value:"Class Decorators",id:"class-decorators",level:2},{value:"@Controller(basePath?)",id:"controllerbasepath",level:3},{value:"@Flow([...middlewares])",id:"flowmiddlewares",level:3},{value:"Endpoint Decorators",id:"endpoint-decorators",level:2},{value:"@Get(path)",id:"getpath",level:3},{value:"@Post(path)",id:"postpath",level:3},{value:"@Patch(path)",id:"patchpath",level:3},{value:"@Put(path)",id:"putpath",level:3},{value:"@Delete(path)",id:"deletepath",level:3},{value:"@Version(v)",id:"versionv",level:3},{value:"@Flow([...middlewares])",id:"flowmiddlewares-1",level:3},{value:"Argument Decorators",id:"argument-decorators",level:2},{value:"@Body() or @Body(options) or @Body(name)",id:"body-or-bodyoptions-or-bodyname",level:3},{value:"@State() or @State(name)",id:"state-or-statename",level:3},{value:"@CurrentUser()",id:"currentuser",level:3},{value:"@Header() or @Header(name)",id:"header-or-headername",level:3},{value:"@Params() or @Params(name)",id:"params-or-paramsname",level:3},{value:"@Query() or @Query(name)",id:"query-or-queryname",level:3},{value:"@Session() or @Session(name)",id:"session-or-sessionname",level:3},{value:"@Req()",id:"req",level:3},{value:"@Res()",id:"res",level:3},{value:"@File()",id:"file",level:3},{value:"@Ctx()",id:"ctx",level:3},{value:"How to programmatically access controller endpoints",id:"how-to-programmatically-access-controller-endpoints",level:2},{value:"How to make custom decorators",id:"how-to-make-custom-decorators",level:2}];function d(e){const n={code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",...(0,o.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.p,{children:"Here are the decorators you can use to define your API."}),"\n",(0,s.jsx)(n.h2,{id:"class-decorators",children:"Class Decorators"}),"\n",(0,s.jsx)(n.p,{children:"These decorators can be used on Classes i.e controllers"}),"\n",(0,s.jsx)(n.h3,{id:"controllerbasepath",children:"@Controller(basePath?)"}),"\n",(0,s.jsxs)(n.p,{children:["Specifies this class as a controller class i.e a container of controller endpoints.\n",(0,s.jsx)(n.code,{children:"basepath"})," is prefixed to all endpoint paths within this class."]}),"\n",(0,s.jsx)(n.h3,{id:"flowmiddlewares",children:"@Flow([...middlewares])"}),"\n",(0,s.jsx)(n.p,{children:'Flow is the Amala terminology for "middleware chain".\nDefine the series of koa middleware that must run (and not throw an error) before any endpoint in this class can satisfy the request.'}),"\n",(0,s.jsx)(n.h2,{id:"endpoint-decorators",children:"Endpoint Decorators"}),"\n",(0,s.jsx)(n.p,{children:"These decorators wrap functions of controller classes."}),"\n",(0,s.jsx)(n.h3,{id:"getpath",children:"@Get(path)"}),"\n",(0,s.jsxs)(n.p,{children:["Specifies a function as a handler to the given GET ",(0,s.jsx)(n.code,{children:"path"})," route. See above examples."]}),"\n",(0,s.jsx)(n.h3,{id:"postpath",children:"@Post(path)"}),"\n",(0,s.jsxs)(n.p,{children:["Specifies a function as a handler to the given POST ",(0,s.jsx)(n.code,{children:"path"})," route. See above examples."]}),"\n",(0,s.jsx)(n.h3,{id:"patchpath",children:"@Patch(path)"}),"\n",(0,s.jsxs)(n.p,{children:["Specifies a function as a handler to the given PATCH ",(0,s.jsx)(n.code,{children:"path"})," route. See above examples."]}),"\n",(0,s.jsx)(n.h3,{id:"putpath",children:"@Put(path)"}),"\n",(0,s.jsxs)(n.p,{children:["Specifies a function as a handler to the given PUT ",(0,s.jsx)(n.code,{children:"path"})," route. See above examples."]}),"\n",(0,s.jsx)(n.h3,{id:"deletepath",children:"@Delete(path)"}),"\n",(0,s.jsxs)(n.p,{children:["Specifies a function as a handler to the given DELETE ",(0,s.jsx)(n.code,{children:"path"})," route. See above examples."]}),"\n",(0,s.jsx)(n.h3,{id:"versionv",children:"@Version(v)"}),"\n",(0,s.jsxs)(n.p,{children:["specify that this route handler only handles version ",(0,s.jsx)(n.code,{children:"v"})," paths. And only if bootstrap options.version contains ",(0,s.jsx)(n.code,{children:"v"}),", otherwise 404."]}),"\n",(0,s.jsx)(n.h3,{id:"flowmiddlewares-1",children:"@Flow([...middlewares])"}),"\n",(0,s.jsx)(n.p,{children:'Flow is JollofJS terminology for "middleware chain".\nDefine the series of middleware that must run (and not throw an error) before this function can satisfy the enpoint. See above example.'}),"\n",(0,s.jsx)(n.h2,{id:"argument-decorators",children:"Argument Decorators"}),"\n",(0,s.jsx)(n.p,{children:"These decorators are used to inject contextual request data into your controller endpoint's arguments.\nTry to be as specific as possible with what you inject so that your endpoint handlers can be more easily tested."}),"\n",(0,s.jsx)(n.h3,{id:"body-or-bodyoptions-or-bodyname",children:"@Body() or @Body(options) or @Body(name)"}),"\n",(0,s.jsx)(n.p,{children:"Injects ctx.request.body or ctx.request.body[name]"}),"\n",(0,s.jsx)(n.h3,{id:"state-or-statename",children:"@State() or @State(name)"}),"\n",(0,s.jsx)(n.p,{children:"Injects ctx.state object or ctx.state[name]"}),"\n",(0,s.jsx)(n.h3,{id:"currentuser",children:"@CurrentUser()"}),"\n",(0,s.jsxs)(n.p,{children:["This is a shortcut to access ",(0,s.jsx)(n.code,{children:"ctx.state.user"}),".\nThat is the standard location for storing the currently logged in user object. e.g when using koa-passport.\nConsider using this along with an authentication guard middleware e.g"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"@Post('/lead')\n@Flow([authMiddleware])\nasync createFoo( @Body() leadData: any, @CurrentUser() user) {\n\n    leadData.userId = user.id\n    return leadData;\n}\n\n"})}),"\n",(0,s.jsx)(n.h3,{id:"header-or-headername",children:"@Header() or @Header(name)"}),"\n",(0,s.jsx)(n.p,{children:"Injects ctx.header object or ctx.header[name]"}),"\n",(0,s.jsx)(n.h3,{id:"params-or-paramsname",children:"@Params() or @Params(name)"}),"\n",(0,s.jsx)(n.p,{children:"Injects ctx.params object or ctx.params[name]"}),"\n",(0,s.jsx)(n.h3,{id:"query-or-queryname",children:"@Query() or @Query(name)"}),"\n",(0,s.jsx)(n.p,{children:"Injects ctx.query object or ctx.query[name]"}),"\n",(0,s.jsx)(n.h3,{id:"session-or-sessionname",children:"@Session() or @Session(name)"}),"\n",(0,s.jsx)(n.p,{children:"This works only if you have a session handler defined in ctx.session e.g koa-session.\nInjects ctx.session object or ctx.session[name]"}),"\n",(0,s.jsx)(n.h3,{id:"req",children:"@Req()"}),"\n",(0,s.jsx)(n.p,{children:"Injects the koa request object. useful when streaming data up to server"}),"\n",(0,s.jsx)(n.h3,{id:"res",children:"@Res()"}),"\n",(0,s.jsx)(n.p,{children:"Injects the koa response object. useful when streaming data down to client."}),"\n",(0,s.jsx)(n.h3,{id:"file",children:"@File()"}),"\n",(0,s.jsx)(n.p,{children:"Injects the request files object. All files uploaded during the request can be found here, indexed by file field name."}),"\n",(0,s.jsx)(n.h3,{id:"ctx",children:"@Ctx()"}),"\n",(0,s.jsx)(n.p,{children:"Injects the whole koa context. For a more descriptive endpoint handler/endpoint, avoid doing this if you can. Opt for more specific injections."}),"\n",(0,s.jsx)(n.h2,{id:"how-to-programmatically-access-controller-endpoints",children:"How to programmatically access controller endpoints"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:'import { getControllers } from "amala";\nconst codex: Record<string,Controller> = getControllers(); //codex is now an index of all the controller functions and their classes.\n'})}),"\n",(0,s.jsxs)(n.p,{children:["To access the controller with the class name ",(0,s.jsx)(n.code,{children:"UserController"}),", you can use ",(0,s.jsx)(n.code,{children:"codex.UserController"})," or ",(0,s.jsx)(n.code,{children:"codex['UserController']"}),".\nBecause amala has you defining your endpoints using the equivalent of async service endpoints, you could essentially run these async service endpoints directly e.g"]}),"\n",(0,s.jsx)(n.p,{children:"Given the endpoint definition:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"@Controller('/user')\nclass UserController {\n    ...\n    @Post('/')\n    async createUser(@Body() userParams: UserParams){\n        // create and return some new user\n    }\n    ...\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["You could directly run the function that the endpoint path ",(0,s.jsx)(n.code,{children:"POST /api/v1/user"})," also runs by simply:\n",(0,s.jsx)(n.code,{children:"const newUser = await codex.userController.createUser(userParams)"})," assuming the function doesn't require any koa context specific parameters."]}),"\n",(0,s.jsx)(n.p,{children:"This becomes somewhat of a useful and clean way to unit-test your endpoint functions."}),"\n",(0,s.jsx)(n.h2,{id:"how-to-make-custom-decorators",children:"How to make custom decorators"}),"\n",(0,s.jsx)(n.p,{children:"Making custom decorators is easy! Just create a wrapper function around the Ctx decorator or any other decorator and you are done.\nDecorators are currently limited to simply referencing fields from koa's ctx."}),"\n",(0,s.jsx)(n.p,{children:"E.g If we wanted to pull something that some middleware has attached to ctx, we can simply say"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"export const Something = ()=>Ctx('something');\n\n"})}),"\n",(0,s.jsx)(n.p,{children:"and then use that in a controller"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"    @Get('/')\n    async myEndpointHandler(@Something() theThing: any) {\n      // theThing lives\n    }\n"})})]})}function h(e={}){const{wrapper:n}={...(0,o.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},1151:(e,n,r)=>{r.d(n,{Z:()=>i,a:()=>a});var s=r(7294);const o={},t=s.createContext(o);function a(e){const n=s.useContext(t);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),s.createElement(t.Provider,{value:n},e.children)}}}]);