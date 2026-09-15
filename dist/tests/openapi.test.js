"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OpenApi_1 = require("../openapi/OpenApi");
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
});
//# sourceMappingURL=openapi.test.js.map