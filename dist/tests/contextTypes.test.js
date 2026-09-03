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
const koa_1 = __importDefault(require("koa"));
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const typedFlow = async (ctx, next) => {
    ctx.state.services = { greeting: 'hello' };
    ctx.requestId = 'request-12';
    const greeting = ctx.state.services.greeting;
    const requestId = ctx.requestId;
    await next();
};
const typeSafetyProbe = async (ctx) => {
    // @ts-expect-error Undeclared context properties must not fall back to `any`.
    ctx.notDeclaredByTheApplication = true;
};
let TypedContextController = class TypedContextController {
    // eslint-disable-next-line no-useless-constructor
    constructor(ctx) {
        this.ctx = ctx;
    }
    value() {
        return {
            greeting: this.ctx.state.services.greeting,
            requestId: this.ctx.requestId
        };
    }
};
__decorate([
    (0, index_1.Get)('/'),
    (0, index_1.Flow)(typedFlow),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TypedContextController.prototype, "value", null);
TypedContextController = __decorate([
    (0, index_1.Controller)('/typed-context'),
    __metadata("design:paramtypes", [Object])
], TypedContextController);
describe('typed Koa context', () => {
    let server;
    afterEach(done => {
        if (server === null || server === void 0 ? void 0 : server.listening) {
            server.close(done);
        }
        else {
            done();
        }
    });
    it('preserves inferred state and context extensions through bootstrap', async () => {
        const app = new koa_1.default();
        const bootstrapped = await (0, index_1.bootstrapControllers)({
            app,
            attachRoutes: true,
            controllers: [TypedContextController],
            disableVersioning: true,
            openAPI: { enabled: false },
            controllerFactory: (ControllerClass, ctx) => {
                const requestId = ctx.requestId;
                const greeting = ctx.state.services.greeting;
                return new ControllerClass(ctx);
            },
            errorHandler: async (error, ctx) => {
                const requestId = ctx.requestId;
                ctx.status = error instanceof Error ? 500 : 520;
            }
        });
        server = bootstrapped.app.listen();
        await (0, supertest_1.default)(server)
            .get('/typed-context')
            .expect(200, { greeting: 'hello', requestId: 'request-12' });
    });
    it('uses safe property-free context defaults', () => {
        const middleware = async (ctx) => {
            // @ts-expect-error The default context has no arbitrary property bag.
            ctx.arbitrary = 'not allowed';
        };
        expect(middleware).toBeDefined();
    });
});
//# sourceMappingURL=contextTypes.test.js.map