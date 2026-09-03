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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiSpec = void 0;
exports.generateOpenApi = generateOpenApi;
const _ = __importStar(require("lodash"));
const tools_1 = require("../util/tools");
function toSimpleSchemaType(value) {
    const normalized = value === null || value === void 0 ? void 0 : value.toLowerCase();
    if (normalized === 'number'
        || normalized === 'integer'
        || normalized === 'boolean'
        || normalized === 'object') {
        return normalized;
    }
    return 'string';
}
function createDefaultOpenApiSpec() {
    return {
        openapi: "3.0.1",
        info: {
            title: "API",
            description: "powered by AmalaJS (https://github.com/iyobo/amala)",
            version: "1.0.0"
        },
        servers: [],
        paths: {},
        components: {
            schemas: {}
        },
        security: [],
        tags: [],
        externalDocs: undefined
    };
}
exports.openApiSpec = createDefaultOpenApiSpec();
function generateOpenApi(metaData, options) {
    var _a;
    // incorporate custom spec values
    const customSpec = ((_a = options.openAPI) === null || _a === void 0 ? void 0 : _a.spec) || {};
    exports.openApiSpec = _.merge(createDefaultOpenApiSpec(), customSpec);
    // overwrite default info with developer's API info. handled by deep merge
    // openApiSpec.info = {...openApiSpec.info, ...options.openAPI.spec.info};
    const meta = { ...metaData };
    // used to build up the paths section of the openAPI spec
    const paths = {};
    const schemas = {
        Object: {
            type: "object",
            properties: {}
        }
    };
    // ---- SERVERS
    const servers = [];
    if (!options.disableVersioning) {
        if (Array.isArray(options.versions)) {
            options.versions.forEach(it => {
                servers.push({
                    url: joinServerUrl(options.openAPI.publicURL, options.basePath, `v${it}`),
                    description: `version ${it}`
                });
            });
        }
        else {
            for (const [k, v] of Object.entries(options.versions)) {
                if (v) {
                    servers.push({
                        url: joinServerUrl(options.openAPI.publicURL, options.basePath, `v${k}`),
                        description: `version ${k}`
                    });
                }
            }
        }
    }
    else {
        servers.push({
            url: joinServerUrl(options.openAPI.publicURL, options.basePath)
        });
    }
    exports.openApiSpec.servers = [...servers, ...(customSpec.servers || [])];
    /**
     * logs encountered SCHEMAS
     */
    function registerSchema(obj) {
        // e.g
        // "Category": {
        //   "type": "object",
        //   "properties": {
        //     "id": {
        //       "type": "integer",
        //       "format": "int64"
        //     },
        //     "name": {
        //       "type": "string"
        //     }
        //   }
        // }
        if (!obj)
            return;
        const meta = (0, tools_1.getPropertiesOfClassValidator)(obj);
        if (Object.keys(meta).length > 0) {
            // this is a class-validator class
            const properties = {};
            const required = [];
            // loop through prototype props
            for (const fieldName in meta) {
                const tr = (0, tools_1.translateMetaField)(meta[fieldName]);
                properties[fieldName] = {
                    type: toSimpleSchemaType(tr.type)
                };
                if (tr.required)
                    required.push(fieldName);
            }
            schemas[obj.name] = {
                type: "object",
                required,
                properties
            };
        }
    }
    /***
     * generate PATHs
     */
    for (const controllerClassName in meta.controllers) {
        // e.g UserController
        const controller = meta.controllers[controllerClassName];
        controller.paths.forEach(controllerPath => {
            const controllerBasePath = convertRegexpToSwagger(controllerPath);
            // for each endpoint
            for (const endpointName in controller.endpoints) {
                const endpoint = controller.endpoints[endpointName];
                // for each path
                endpoint.paths.forEach(endpointPath => {
                    var _a, _b;
                    // PROCESS ENDPOINT
                    const fullPath = joinRoutePath(controllerBasePath, convertRegexpToSwagger(endpointPath === "/" ? "" : endpointPath));
                    const verb = endpoint.verb;
                    paths[fullPath] = paths[fullPath] || {};
                    const parameters = [
                    // {
                    //   "in": "path",
                    //   "name": "userId",
                    //   "required": true,
                    //   "schema": {
                    //     "type": "string"
                    //   }
                    // }
                    ];
                    const requestBodyProperties = {};
                    const requestBodyRequired = [];
                    /**
                     *  For each argument, divide it between requestBody (source:body) or parameters (any other source).
                     *  extract fields from classvalidators into its own function.
                     *  TODO: make it a nested thing.
                     * */
                    for (const argId in endpoint.arguments) {
                        const argumentMeta = endpoint.arguments[argId];
                        const ctxKey = argumentMeta.ctxKey;
                        // We only care about arguments with @Body, @Query or @Params decorators
                        if (!isDocumentedSource(ctxKey))
                            continue;
                        // register schema if applicable
                        registerSchema(argumentMeta.argType);
                        // const ctxValueOptions = argumentMeta.ctxValueOptions;
                        // const valueOptionsType = typeof argumentMeta.ctxValueOptions;
                        let required = false;
                        const oasSource = deriveOasSource(ctxKey);
                        if (argumentMeta.ctxValueOptions && typeof argumentMeta.ctxValueOptions !== "string") {
                            // injection object
                            required = Boolean(argumentMeta.ctxValueOptions.required);
                        }
                        // if the argument exists as part of path, consider to be required
                        if (oasSource === "path") {
                            required = true;
                        }
                        // build parameters
                        const meta = (0, tools_1.getPropertiesOfClassValidator)(argumentMeta.argType);
                        const metaEntries = Object.entries(meta);
                        if (metaEntries.length > 0) {
                            metaEntries.forEach(it => {
                                const tr = (0, tools_1.translateMetaField)(it[1]);
                                if (oasSource === "body") {
                                    requestBodyProperties[it[0]] = {
                                        type: toSimpleSchemaType(tr.type)
                                    };
                                    if (tr.required)
                                        requestBodyRequired.push(it[0]);
                                }
                                else {
                                    parameters.push({
                                        name: it[0],
                                        in: oasSource,
                                        required: oasSource !== "path" ? tr.required : undefined,
                                        schema: {
                                            // @ts-ignore
                                            type: tr.type || "string"
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            if (oasSource === "body") {
                                const propertyName = String(argumentMeta.ctxValueOptions);
                                requestBodyProperties[propertyName] = {
                                    type: toSimpleSchemaType(((_a = argumentMeta.argType) === null || _a === void 0 ? void 0 : _a.name) || "object"),
                                };
                                if (required)
                                    requestBodyRequired.push(propertyName);
                            }
                            else {
                                parameters.push({
                                    name: String(argumentMeta.ctxValueOptions),
                                    in: oasSource,
                                    required: oasSource !== "path" ? required : undefined,
                                    schema: {
                                        type: toSimpleSchemaType(((_b = argumentMeta.argType) === null || _b === void 0 ? void 0 : _b.name) || "object")
                                    }
                                });
                            }
                        }
                    }
                    const requestBody = {
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: requestBodyProperties,
                                    required: requestBodyRequired.length ? requestBodyRequired : undefined
                                }
                            },
                            "application/x-www-form-urlencoded": {
                                schema: {
                                    type: "object",
                                    properties: requestBodyProperties,
                                    required: requestBodyRequired.length ? requestBodyRequired : undefined
                                }
                            },
                        }
                    };
                    // Finalize path
                    paths[fullPath][verb] = {
                        operationId: `${controllerClassName}.${endpointName}`,
                        summary: endpointName,
                        tags: [
                            controllerClassName
                        ],
                        // @ts-ignore
                        requestBody: Object.keys(requestBodyProperties).length > 0 ? requestBody : undefined,
                        parameters,
                        responses: {
                            "2xx": {
                                description: "Successful response",
                                headers: {},
                                content: {
                                    "application/json": {
                                        schema: {
                                            // TODO: Implement @Return decorator
                                            $ref: `#/components/schemas/Object`
                                        }
                                    }
                                }
                            }
                        }
                    };
                });
            }
        });
    }
    exports.openApiSpec.paths = _.merge({}, customSpec.paths || {}, paths);
    exports.openApiSpec.components = exports.openApiSpec.components || {};
    exports.openApiSpec.components.schemas = {
        ...(exports.openApiSpec.components.schemas || {}),
        ...schemas
    };
    // @ts-ignore
    // openApiSpec.components.requestBodies = schemas;
    // console.log('OpenApi.init', meta);
}
function joinRoutePath(...segments) {
    const path = segments
        .join('/')
        .split('/')
        .filter(Boolean)
        .join('/');
    return path ? `/${path}` : '/';
}
function joinServerUrl(publicURL = '', ...segments) {
    const origin = publicURL.replace(/\/+$/, '');
    const path = joinRoutePath(...segments);
    if (path === '/')
        return origin || '/';
    return `${origin}${path}`;
}
function convertRegexpToSwagger(path) {
    const swaggerPath = [];
    let paramMode = false;
    for (const c of String(path)) {
        if (c === ":") {
            paramMode = true;
            swaggerPath.push("{");
        }
        else if (paramMode && c === "/") {
            paramMode = false;
            swaggerPath.push("}/");
        }
        else {
            swaggerPath.push(c);
        }
    }
    if (paramMode)
        swaggerPath.push("}");
    return swaggerPath.join("");
}
function isDocumentedSource(source) {
    return source === 'body' || source === 'query' || source === 'params';
}
function deriveOasSource(source) {
    switch (source) {
        case "params": {
            return "path";
        }
        default: {
            return source;
        }
    }
}
//# sourceMappingURL=OpenApi.js.map