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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenApi = exports.openApiSpec = void 0;
const _ = __importStar(require("lodash"));
const tools_1 = require("../util/tools");
exports.openApiSpec = {
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
function generateOpenApi(metaData, options) {
    var _a, _b;
    // incorporate custom spec values
    exports.openApiSpec = _.merge(exports.openApiSpec, options.openAPI.spec);
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
    const rootPath = options.openAPI.publicURL + options.basePath;
    if (!options.disableVersioning) {
        if (Array.isArray(options.versions)) {
            options.versions.forEach(it => {
                servers.push({
                    url: rootPath + "/v" + it,
                    description: `version ${it}`
                });
            });
        }
        else {
            for (const [k, v] of Object.entries(options.versions)) {
                if (v) {
                    servers.push({
                        url: rootPath + "/v" + k,
                        description: `version ${k}`
                    });
                }
            }
        }
    }
    else {
        servers.push({
            url: options.openAPI.publicURL
        });
    }
    exports.openApiSpec.servers = [...servers, ...(((_b = (_a = options.openAPI) === null || _a === void 0 ? void 0 : _a.spec) === null || _b === void 0 ? void 0 : _b.servers) || [])];
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
                    type: tr.type
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
            const basePath = options.basePath + convertRegexpToSwagger(controllerPath);
            // for each endpoint
            for (const endpointName in controller.endpoints) {
                const endpoint = controller.endpoints[endpointName];
                // for each path
                endpoint.paths.forEach(endpointPath => {
                    var _a, _b;
                    // PROCESS ENDPOINT
                    const fullPath = basePath + convertRegexpToSwagger((endpointPath === "/" ? "" : endpointPath));
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
                    /**
                     *  For each argument, divide it between requestBody (source:body) or parameters (any other source).
                     *  extract fields from classvalidators into its own function.
                     *  TODO: make it a nested thing.
                     * */
                    for (const argId in endpoint.arguments) {
                        const argumentMeta = endpoint.arguments[argId];
                        const ctxKey = argumentMeta.ctxKey;
                        // We only care about arguments with @Body, @Query or @Params decorators
                        if (!["body", "query", "params"].includes(ctxKey))
                            continue;
                        // register schema if applicable
                        registerSchema(argumentMeta.argType);
                        // const ctxValueOptions = argumentMeta.ctxValueOptions;
                        // const valueOptionsType = typeof argumentMeta.ctxValueOptions;
                        let required = false;
                        const oasSource = deriveOasSoure(argumentMeta.ctxKey);
                        if (argumentMeta.ctxValueOptions && typeof argumentMeta.ctxValueOptions !== "string") {
                            // injection object
                            required = argumentMeta.ctxValueOptions.required || false;
                        }
                        // if the argument exists as part of path, consider to be required
                        if (oasSource === "path") {
                            required = true;
                        }
                        // build parameters
                        const meta = (0, tools_1.getPropertiesOfClassValidator)(argumentMeta.argType);
                        const metaEntries = Object.entries(meta);
                        if (metaEntries.length > 0) {
                            metaEntries.forEach((it, idx) => {
                                const tr = (0, tools_1.translateMetaField)(it[1]);
                                if (oasSource === "body") {
                                    requestBodyProperties[it[0]] = { type: tr.type, required: tr.required };
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
                                requestBodyProperties[argumentMeta.ctxValueOptions] = {
                                    type: ((_a = argumentMeta.argType) === null || _a === void 0 ? void 0 : _a.name) || "object",
                                    required
                                };
                            }
                            else {
                                parameters.push({
                                    name: argumentMeta.ctxValueOptions,
                                    in: oasSource,
                                    required: oasSource !== "path" ? required : undefined,
                                    schema: {
                                        type: ((_b = argumentMeta.argType) === null || _b === void 0 ? void 0 : _b.name) || "object"
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
                                    properties: requestBodyProperties
                                }
                            },
                            "application/x-www-form-urlencoded": {
                                schema: {
                                    type: "object",
                                    properties: requestBodyProperties
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
    exports.openApiSpec.paths = paths;
    exports.openApiSpec.components.schemas = schemas;
    // @ts-ignore
    // openApiSpec.components.requestBodies = schemas;
    // console.log('OpenApi.init', meta);
}
exports.generateOpenApi = generateOpenApi;
function convertRegexpToSwagger(path) {
    const swaggerPath = [];
    let paramMode = false;
    for (const c of path) {
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
function deriveOasSoure(source) {
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