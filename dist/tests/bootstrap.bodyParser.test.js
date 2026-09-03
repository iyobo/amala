"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const ArgController_1 = require("./util/controllers/ArgController");
describe('security-sensitive bootstrap options', () => {
    let nativeServer;
    let testServer;
    beforeAll(async () => {
        const { app } = await (0, index_1.bootstrapControllers)({
            attachRoutes: true,
            basePath: '/api',
            bodyParser: { multipart: false },
            controllers: [ArgController_1.ArgController],
            disableVersioning: true,
            openAPI: { enabled: false }
        });
        nativeServer = app.listen();
        testServer = (0, supertest_1.default)(nativeServer);
    });
    afterAll(done => {
        if (nativeServer.listening) {
            nativeServer.close(done);
        }
        else {
            done();
        }
    });
    it('keeps JSON parsing enabled', async () => {
        const payload = { dish: 'amala and ewedu' };
        const response = await testServer
            .post('/api/arg/bodySimple')
            .send(payload)
            .expect(200);
        expect(response.body).toEqual(payload);
    });
    it('honors multipart: false instead of parsing uploads', async () => {
        await testServer
            .post('/api/arg/uploadFile2')
            .field('testFile', 'not parsed')
            .expect(204);
    });
    it('uses a same-origin OpenAPI URL when publicURL is omitted', () => {
        expect(index_1.options.openAPI.publicURL).toBe('');
    });
});
//# sourceMappingURL=bootstrap.bodyParser.test.js.map