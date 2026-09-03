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
let SafeErrorLogController = class SafeErrorLogController {
    fail() {
        throw new Error('authorization=secret-value');
    }
};
__decorate([
    (0, index_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SafeErrorLogController.prototype, "fail", null);
SafeErrorLogController = __decorate([
    (0, index_1.Controller)('/safe-error-log')
], SafeErrorLogController);
describe('default error logging', () => {
    let server;
    afterEach(done => {
        jest.restoreAllMocks();
        if (server === null || server === void 0 ? void 0 : server.listening) {
            server.close(done);
        }
        else {
            done();
        }
    });
    it('does not write raw exception details', async () => {
        const errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const { app } = await (0, index_1.bootstrapControllers)({
            attachRoutes: true,
            controllers: [SafeErrorLogController],
            disableVersioning: true,
            openAPI: { enabled: false }
        });
        server = app.listen();
        await (0, supertest_1.default)(server)
            .get('/safe-error-log')
            .expect(500, { error: 'Internal Server Error' });
        expect(errorLog).toHaveBeenCalledWith('Amala: request failed with status 500');
        expect(JSON.stringify(errorLog.mock.calls)).not.toContain('secret-value');
    });
});
//# sourceMappingURL=errorLogging.test.js.map