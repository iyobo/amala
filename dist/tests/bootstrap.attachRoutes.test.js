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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
let RouteAttachmentController = class RouteAttachmentController {
    status() {
        return { attached: true };
    }
};
__decorate([
    (0, index_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RouteAttachmentController.prototype, "status", null);
RouteAttachmentController = __decorate([
    (0, index_1.Controller)('/route-attachment')
], RouteAttachmentController);
describe('route attachment', () => {
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
    it('attaches generated routes by default', async () => {
        const { app } = await (0, index_1.bootstrapControllers)({
            controllers: [RouteAttachmentController],
            disableVersioning: true,
            openAPI: { enabled: false }
        });
        const server = app.listen();
        servers.push(server);
        expect(index_1.options.attachRoutes).toBe(true);
        await (0, supertest_1.default)(server)
            .get('/route-attachment')
            .expect(200, { attached: true });
    });
    it('leaves routes unmounted when explicitly disabled', async () => {
        const { app } = await (0, index_1.bootstrapControllers)({
            attachRoutes: false,
            controllers: [RouteAttachmentController],
            disableVersioning: true,
            openAPI: { enabled: false }
        });
        const server = app.listen();
        servers.push(server);
        expect(index_1.options.attachRoutes).toBe(false);
        await (0, supertest_1.default)(server).get('/route-attachment').expect(404);
    });
    it('returns the generated router for manual composition', async () => {
        const { app, router } = await (0, index_1.bootstrapControllers)({
            attachRoutes: false,
            controllers: [RouteAttachmentController],
            disableVersioning: true,
            openAPI: { enabled: false }
        });
        app.use(router.routes());
        app.use(router.allowedMethods());
        const server = app.listen();
        servers.push(server);
        await (0, supertest_1.default)(server)
            .get('/route-attachment')
            .expect(200, { attached: true });
    });
});
//# sourceMappingURL=bootstrap.attachRoutes.test.js.map