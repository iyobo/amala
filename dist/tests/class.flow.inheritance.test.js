"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
let nativeServer;
let testServer;
beforeAll(async () => {
    const { app, router } = await (0, index_1.bootstrapControllers)({
        basePath: "/api",
        controllers: [__dirname + "/util/controllers/**/*.ts"],
        versions: ["1", "2"]
    });
    app.use(router.routes());
    app.use(router.allowedMethods());
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
describe("Controller class", () => {
    it("Flow can be inherited from class", async () => {
        await testServer.get("/api/v2/protected").expect(401);
    });
    it("Flow should throw unexpected errors", async () => {
        const originalHandler = console.error;
        console.error = jest.fn();
        await testServer.get("/api/v2/endpoint/badFlow").expect(500);
        console.error = originalHandler;
    });
});
//# sourceMappingURL=class.flow.inheritance.test.js.map