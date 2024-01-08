"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.addArgumentDecorator = exports.bootstrapControllers = exports.getControllers = exports.metadata = exports.options = void 0;
require("reflect-metadata");
const router_1 = __importDefault(require("@koa/router"));
const generateRoutes_1 = require("./util/generateRoutes");
const importClasses_1 = require("./util/importClasses");
const boom_1 = __importDefault(require("@hapi/boom"));
const OpenApi_1 = require("./openapi/OpenApi");
const koa_body_1 = __importDefault(require("koa-body"));
const koa_1 = __importDefault(require("koa"));
const koa_helmet_1 = __importDefault(require("koa-helmet"));
const common_1 = require("./decorators/common");
const koa2_swagger_ui_1 = require("koa2-swagger-ui");
const cors_1 = __importDefault(require("@koa/cors"));
exports.metadata = {
    controllers: {}
};
function getControllers() {
    return exports.metadata.controllers;
}
exports.getControllers = getControllers;
const defaultErrorHandler = async (err, ctx) => {
    if (err.isBoom) {
        const error = err.output.payload;
        error.errorDetails = error.statusCode >= 500 ? undefined : err.data;
        ctx.body = error;
        ctx.status = error.statusCode;
        if (error.statusCode >= 500)
            console.error(err);
    }
    else {
        ctx.body = { error: 'Internal Server Error' };
        ctx.status = 500;
        console.error(err);
    }
};
/**
 *
 * @param app - Koa instance
 * @param params - KoaControllerOptions
 */
const bootstrapControllers = async (params) => {
    var _a;
    exports.options = params;
    const app = exports.options.app = exports.options.app || new koa_1.default();
    exports.options.router = exports.options.router || new router_1.default();
    exports.options.versions = exports.options.versions || { 1: true };
    exports.options.flow = exports.options.flow || [];
    if (exports.options.useHelmet) {
        const opts = exports.options.useHelmet === true ? undefined : exports.options.useHelmet;
        exports.options.flow = [(0, koa_helmet_1.default)(opts), ...exports.options.flow];
    }
    exports.options.validatorOptions = exports.options.validatorOptions || {};
    exports.options.errorHandler = exports.options.errorHandler || defaultErrorHandler;
    exports.options.openAPI = exports.options.openAPI || { enabled: true, publicURL: 'http://[publicURl]' };
    exports.options.openAPI.specPath = `${exports.options.basePath}/${exports.options.openAPI.specPath || 'docs'}`;
    exports.options.openAPI.webPath = `${exports.options.basePath}/${exports.options.openAPI.webPath || 'swagger'}`;
    exports.options.openAPI.spec = exports.options.openAPI.spec || OpenApi_1.openApiSpec;
    exports.options.bodyParser = exports.options.bodyParser === false ? false : exports.options.bodyParser;
    exports.options.diagnostics = exports.options.diagnostics || false;
    exports.options.cors = exports.options.cors || { enabled: true, opts: {} };
    /**
     * Versions can be defined in multiple ways.
     * If an array, it's just a list of active versions.
     * If as an object, then this datastructure can define not only active versions but obsolete versions as well.
     *
     * The object is the native form. Arrays are converted to object.
     */
    // if versions are in array for, convert to object
    if (Array.isArray(exports.options.versions)) {
        const versions = {};
        exports.options.versions.forEach(version => {
            versions[version] = true;
        });
        exports.options.versions = versions;
    }
    // CORS
    if ((_a = exports.options.cors) === null || _a === void 0 ? void 0 : _a.enabled) {
        app.use((0, cors_1.default)(exports.options.cors.opts));
    }
    // Amala's Error handling middleware
    app.use(async (ctx, next) => {
        try {
            await next();
        }
        catch (err) {
            await exports.options.errorHandler(err, ctx);
        }
    });
    /**
     * We don't need to do anything with the array of Controller classes thesse return because the decorators have
     * already loaded up the classes into metadata.
     *
     * The Controller class files just need to be loaded. They will handle their own registration in metadata
     */
    for (const controllerDef of exports.options.controllers) {
        if (typeof controllerDef === 'string') {
            // This is a path. get all controllers in that folder
            if (exports.options.diagnostics)
                console.info(`Amala: munching controllers in path ${controllerDef}`);
            (0, importClasses_1.importClassesFromDirectories)(controllerDef); // this is a string glob path. Load controllers from path
        }
        else {
            /**
             * These are actual classes so Nothing to do here.
             * Their decorators have already registered them in the metadata.
             */
        }
    }
    // Register all global flows
    exports.options.flow.forEach(flow => {
        app.use(flow);
    });
    //
    await (0, generateRoutes_1.generateRoutes)(exports.options.router, exports.options, exports.metadata);
    // open api
    if (exports.options.openAPI.enabled) {
        // Generate OpenAPI/Swagger spec
        await (0, OpenApi_1.generateOpenApi)(exports.metadata, exports.options);
        exports.options.router.get(exports.options.openAPI.specPath, (ctx) => {
            ctx.body = OpenApi_1.openApiSpec;
        });
        if (exports.options.openAPI.webPath) {
            app.use((0, koa2_swagger_ui_1.koaSwagger)({
                routePrefix: exports.options.openAPI.webPath,
                swaggerOptions: {
                    url: `${exports.options.openAPI.publicURL}${exports.options.openAPI.specPath}`, // example path to json
                },
            }));
        }
    }
    // body parser
    if (exports.options.bodyParser !== false) {
        app.use((0, koa_body_1.default)({
            ...exports.options.bodyParser,
            // includeUnparsed: true,
            multipart: true
        }));
    }
    if (exports.options.attachRoutes) {
        // Combine routes
        app.use(exports.options.router.routes());
        app.use(exports.options.router.allowedMethods({
            methodNotAllowed: () => boom_1.default.notFound(),
            notImplemented: () => boom_1.default.notImplemented(),
            throw: true,
        }));
    }
    return { app, router: exports.options.router };
};
exports.bootstrapControllers = bootstrapControllers;
__exportStar(require("class-validator"), exports);
__exportStar(require("class-transformer"), exports);
/**
 * Allows for custom Decorators to be created by developers.
 */
exports.addArgumentDecorator = common_1.addArgumentInjectMeta;
var errors_1 = require("./util/errors");
Object.defineProperty(exports, "errors", { enumerable: true, get: function () { return errors_1.errors; } });
// export {Ctx} from './decorators/endpoints/args/ctx';
// export {Query} from './decorators/endpoints/args/query';
// export {Params} from './decorators/endpoints/args/params';
// export {Res} from './decorators/endpoints/args/res';
// export {File} from './decorators/endpoints/args/file';
// export {Req} from './decorators/endpoints/args/req';
// export {State} from './decorators/endpoints/args/state';
// export {CurrentUser} from './decorators/endpoints/args/currentUser';
// export {Session} from './decorators/endpoints/args/session';
// export {Body} from './decorators/endpoints/args/body';
// export {Header} from './decorators/endpoints/args/header';
// export {Flow} from './decorators/hybrid/flow';
// export {Version} from './decorators/endpoints/version';
// export {Delete} from './decorators/endpoints/delete';
// export {Patch} from './decorators/endpoints/patch';
// export {Put} from './decorators/endpoints/put';
// export {Post} from './decorators/endpoints/post';
// export {Get} from './decorators/endpoints/get';
// export {Controller} from './decorators/controllers/controller';
__exportStar(require("./decorators"), exports);
//# sourceMappingURL=index.js.map