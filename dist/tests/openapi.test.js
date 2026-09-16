"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OpenApi_1 = require("../openapi/OpenApi");
const zod_1 = require("zod");
function metadataFor(controllerPath, endpointPath) {
    return {
        controllers: {
            TestController: {
                paths: [controllerPath],
                endpoints: {
                    getOne: {
                        arguments: {},
                        paths: [endpointPath],
                        verb: 'get'
                    }
                }
            }
        }
    };
}
function generate(metadata, overrides = {}) {
    (0, OpenApi_1.generateOpenApi)(metadata, {
        basePath: '/api',
        controllers: [],
        disableVersioning: false,
        openAPI: {
            enabled: true,
            publicURL: 'https://api.example.com/',
            spec: {}
        },
        versions: { 1: true },
        ...overrides
    });
    return OpenApi_1.openApiSpec;
}
function standardSchema(jsonSchema) {
    return {
        '~standard': {
            version: 1,
            vendor: 'openapi-test',
            validate: value => ({ value }),
            jsonSchema: {
                input: () => jsonSchema,
                output: () => jsonSchema
            }
        }
    };
}
const runtimeOnlySchema = {
    '~standard': {
        version: 1,
        vendor: 'openapi-test',
        validate: value => ({ value })
    }
};
describe('OpenAPI path generation', () => {
    it('includes basePath once for versioned APIs', () => {
        const spec = generate(metadataFor('/users', '/:id'), {
            versions: { 1: true, 2: false }
        });
        expect(spec.servers).toEqual([
            { url: 'https://api.example.com/api/v1', description: 'version 1' }
        ]);
        expect(Object.keys(spec.paths)).toEqual(['/users/{id}']);
    });
    it('emits a conforming OpenAPI 3.0 version and response range', () => {
        var _a;
        const spec = generate(metadataFor('/users', '/:id'));
        const operation = (_a = spec.paths['/users/{id}']) === null || _a === void 0 ? void 0 : _a.get;
        expect(spec.openapi).toBe('3.0.1');
        expect(operation === null || operation === void 0 ? void 0 : operation.responses['2XX']).toBeDefined();
        expect(operation === null || operation === void 0 ? void 0 : operation.responses['2xx']).toBeUndefined();
    });
    it('marks path parameters as required', () => {
        var _a;
        const metadata = metadataFor('/users', '/:id');
        metadata.controllers.TestController.endpoints.getOne.arguments = {
            0: {
                ctxKey: 'params',
                ctxValueOptions: 'id'
            }
        };
        const spec = generate(metadata);
        const operation = (_a = spec.paths['/users/{id}']) === null || _a === void 0 ? void 0 : _a.get;
        expect(operation === null || operation === void 0 ? void 0 : operation.parameters).toContainEqual({
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'object' }
        });
    });
    it('documents JSON request bodies', () => {
        var _a;
        const metadata = metadataFor('/users', '/');
        const endpoint = metadata.controllers.TestController.endpoints.getOne;
        endpoint.verb = 'post';
        endpoint.arguments = {
            0: {
                ctxKey: 'body',
                ctxValueOptions: 'name'
            }
        };
        const spec = generate(metadata);
        const operation = (_a = spec.paths['/users']) === null || _a === void 0 ? void 0 : _a.post;
        const requestBody = operation === null || operation === void 0 ? void 0 : operation.requestBody;
        expect(requestBody).toMatchObject({
            content: {
                'application/json': {
                    schema: {
                        properties: {
                            name: { type: 'object' }
                        },
                        type: 'object'
                    }
                }
            }
        });
    });
    it('includes basePath once for unversioned APIs', () => {
        const spec = generate(metadataFor('/users/', '/'), {
            disableVersioning: true
        });
        expect(spec.servers).toEqual([{ url: 'https://api.example.com/api' }]);
        expect(Object.keys(spec.paths)).toEqual(['/users']);
    });
    it('does not leak generated paths between bootstrap calls', () => {
        generate(metadataFor('/first', '/'));
        const spec = generate(metadataFor('/second', '/'));
        expect(spec.paths['/first']).toBeUndefined();
        expect(spec.paths['/second']).toBeDefined();
    });
    it('preserves custom paths and servers', () => {
        const spec = generate(metadataFor('/generated', '/'), {
            openAPI: {
                enabled: true,
                publicURL: '',
                spec: {
                    paths: {
                        '/health': {
                            get: {
                                responses: { '200': { description: 'Healthy' } }
                            }
                        }
                    },
                    servers: [{ url: 'https://backup.example.com' }]
                }
            }
        });
        expect(spec.servers).toEqual([
            { url: '/api/v1', description: 'version 1' },
            { url: 'https://backup.example.com' }
        ]);
        expect(spec.paths['/health']).toBeDefined();
        expect(spec.paths['/generated']).toBeDefined();
    });
    it('uses a Standard JSON Schema as the complete request body', () => {
        var _a;
        const metadata = metadataFor('/orders', '/');
        const endpoint = metadata.controllers.TestController.endpoints.getOne;
        endpoint.verb = 'post';
        endpoint.arguments = {
            0: {
                ctxKey: 'body',
                standardSchema: standardSchema({
                    type: 'object',
                    required: ['sku'],
                    properties: { sku: { type: 'string', minLength: 1 } }
                })
            }
        };
        const spec = generate(metadata);
        const operation = (_a = spec.paths['/orders']) === null || _a === void 0 ? void 0 : _a.post;
        expect(operation === null || operation === void 0 ? void 0 : operation.requestBody).toMatchObject({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['sku'],
                        properties: { sku: { type: 'string', minLength: 1 } }
                    }
                }
            }
        });
    });
    it('uses the Standard JSON Schema capability exposed by Zod', () => {
        var _a;
        const metadata = metadataFor('/orders', '/');
        const endpoint = metadata.controllers.TestController.endpoints.getOne;
        endpoint.verb = 'post';
        endpoint.arguments = {
            0: {
                ctxKey: 'body',
                standardSchema: zod_1.z.object({ sku: zod_1.z.string().min(1) })
            }
        };
        const operation = (_a = generate(metadata).paths['/orders']) === null || _a === void 0 ? void 0 : _a.post;
        expect(operation === null || operation === void 0 ? void 0 : operation.requestBody).toMatchObject({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['sku'],
                        properties: { sku: { type: 'string', minLength: 1 } }
                    }
                }
            }
        });
    });
    it('requests the OpenAPI 3.0 Standard JSON Schema target', () => {
        const input = jest.fn(() => ({ type: 'string' }));
        const schema = {
            '~standard': {
                version: 1,
                vendor: 'openapi-test',
                validate: value => ({ value }),
                jsonSchema: { input, output: () => ({ type: 'string' }) }
            }
        };
        const metadata = metadataFor('/orders', '/');
        const endpoint = metadata.controllers.TestController.endpoints.getOne;
        endpoint.verb = 'post';
        endpoint.arguments = { 0: { ctxKey: 'body', standardSchema: schema } };
        generate(metadata);
        expect(input).toHaveBeenCalledWith({ target: 'openapi-3.0' });
    });
    it('expands a whole query schema into query parameters', () => {
        var _a;
        const metadata = metadataFor('/orders', '/');
        metadata.controllers.TestController.endpoints.getOne.arguments = {
            0: {
                ctxKey: 'query',
                standardSchema: standardSchema({
                    type: 'object',
                    required: ['page'],
                    properties: {
                        page: { type: 'integer', minimum: 1 },
                        search: { type: 'string' }
                    }
                })
            }
        };
        const operation = (_a = generate(metadata).paths['/orders']) === null || _a === void 0 ? void 0 : _a.get;
        expect(operation === null || operation === void 0 ? void 0 : operation.parameters).toEqual([
            {
                name: 'page',
                in: 'query',
                required: true,
                schema: { type: 'integer', minimum: 1 }
            },
            {
                name: 'search',
                in: 'query',
                required: false,
                schema: { type: 'string' }
            }
        ]);
    });
    it('documents a selected path value as required', () => {
        var _a;
        const metadata = metadataFor('/orders', '/:id');
        metadata.controllers.TestController.endpoints.getOne.arguments = {
            0: {
                ctxKey: 'params',
                ctxValueOptions: 'id',
                standardSchema: standardSchema({ type: 'integer', minimum: 1 })
            }
        };
        const operation = (_a = generate(metadata).paths['/orders/{id}']) === null || _a === void 0 ? void 0 : _a.get;
        expect(operation === null || operation === void 0 ? void 0 : operation.parameters).toEqual([{
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'integer', minimum: 1 }
            }]);
    });
    it('omits invented docs when a Standard Schema has no JSON capability', () => {
        var _a;
        const metadata = metadataFor('/orders', '/');
        const endpoint = metadata.controllers.TestController.endpoints.getOne;
        endpoint.verb = 'post';
        endpoint.arguments = {
            0: { ctxKey: 'body', standardSchema: runtimeOnlySchema }
        };
        const operation = (_a = generate(metadata).paths['/orders']) === null || _a === void 0 ? void 0 : _a.post;
        expect(operation === null || operation === void 0 ? void 0 : operation.requestBody).toBeUndefined();
        expect(operation === null || operation === void 0 ? void 0 : operation.parameters).toEqual([]);
    });
    it('reports a missing JSON capability only in diagnostics mode', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const metadata = metadataFor('/orders', '/');
        metadata.controllers.TestController.endpoints.getOne.arguments = {
            0: { ctxKey: 'body', standardSchema: runtimeOnlySchema }
        };
        generate(metadata);
        expect(warn).not.toHaveBeenCalled();
        generate(metadata, { diagnostics: true });
        expect(warn).toHaveBeenCalledWith('Amala: Standard Schema does not provide OpenAPI conversion');
        warn.mockRestore();
    });
    it('omits failed conversions and warns only in diagnostics mode', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const throwingSchema = {
            '~standard': {
                version: 1,
                vendor: 'openapi-test',
                validate: value => ({ value }),
                jsonSchema: {
                    input: () => { throw new Error('private converter details'); },
                    output: () => ({})
                }
            }
        };
        const metadata = metadataFor('/orders', '/');
        const endpoint = metadata.controllers.TestController.endpoints.getOne;
        endpoint.verb = 'post';
        endpoint.arguments = {
            0: { ctxKey: 'body', standardSchema: throwingSchema }
        };
        generate(metadata);
        expect(warn).not.toHaveBeenCalled();
        generate(metadata, { diagnostics: true });
        expect(warn).toHaveBeenCalledWith('Amala: Standard Schema OpenAPI conversion failed');
        expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('private converter details'));
        warn.mockRestore();
    });
});
//# sourceMappingURL=openapi.test.js.map