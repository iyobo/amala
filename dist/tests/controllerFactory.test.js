"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boom_1 = __importDefault(require("@hapi/boom"));
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
let FactoryController = class FactoryController {
    // eslint-disable-next-line no-useless-constructor
    constructor(dependency) {
        this.dependency = dependency;
    }
    value() {
        if ('state' in this.dependency) {
            return {
                source: 'context',
                path: this.dependency.path
            };
        }
        return this.dependency;
    }
};
__decorate([
    (0, index_1.Get)('/value'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FactoryController.prototype, "value", null);
FactoryController = __decorate([
    (0, index_1.Controller)('/factory'),
    __metadata("design:paramtypes", [Object])
], FactoryController);
describe('controllerFactory', () => {
    const servers = [];
    afterEach(done => {
        const server = servers.pop();
        if (server === null || server === void 0 ? void 0 : server.listening) {
            server.close(done);
        }
        else {
            done();
        }
    });
    it('preserves the default constructor-with-context behavior', async () => {
        const { app } = await (0, index_1.bootstrapControllers)({
            attachRoutes: true,
            controllers: [FactoryController],
            disableVersioning: true,
            openAPI: { enabled: false }
        });
        const server = app.listen();
        servers.push(server);
        const response = await (0, supertest_1.default)(server).get('/factory/value').expect(200);
        expect(response.body).toEqual({ source: 'context', path: '/factory/value' });
    });
    it('resolves an asynchronous controller instance for each request', async () => {
        const contexts = [];
        const { app } = await (0, index_1.bootstrapControllers)({
            attachRoutes: true,
            controllers: [FactoryController],
            controllerFactory: async (ControllerClass, ctx) => {
                contexts.push(ctx);
                return new ControllerClass({ source: 'container', requestId: ctx.path });
            },
            disableVersioning: true,
            openAPI: { enabled: false }
        });
        const server = app.listen();
        servers.push(server);
        await (0, supertest_1.default)(server)
            .get('/factory/value')
            .expect(200, { source: 'container', requestId: '/factory/value' });
        await (0, supertest_1.default)(server)
            .get('/factory/value')
            .expect(200, { source: 'container', requestId: '/factory/value' });
        expect(contexts).toHaveLength(2);
        expect(contexts[0]).not.toBe(contexts[1]);
    });
    it('fails closed when the factory does not return an instance', async () => {
        const { app } = await (0, index_1.bootstrapControllers)({
            attachRoutes: true,
            controllers: [FactoryController],
            controllerFactory: async () => undefined,
            disableVersioning: true,
            errorHandler: async (error, ctx) => {
                ctx.status = boom_1.default.isBoom(error) ? error.output.statusCode : 500;
                ctx.body = {
                    message: error instanceof Error ? error.message : 'Unknown error'
                };
            },
            openAPI: { enabled: false }
        });
        const server = app.listen();
        servers.push(server);
        const response = await (0, supertest_1.default)(server).get('/factory/value').expect(500);
        expect(response.body.message).toContain('Controller factory did not return an instance for FactoryController');
    });
});
//# sourceMappingURL=controllerFactory.test.js.map