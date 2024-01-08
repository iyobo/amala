"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const EndpointController_1 = require("./util/controllers/EndpointController");
const ArgController_1 = require("./util/controllers/ArgController");
const ProtectedController_1 = require("./util/controllers/ProtectedController");
let nativeServer;
let testServer;
beforeAll(async () => {
    const { app, router } = await (0, index_1.bootstrapControllers)({
        basePath: "/api",
        controllers: [EndpointController_1.EndpointController, ArgController_1.ArgController, ProtectedController_1.ProtectedController],
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
describe("bootstrapping server", () => {
    it("should succeed ", async () => {
        const response = await testServer.get("/api/v2/endpoint").expect(200);
        expect(response.text).toEqual("okay");
    });
    it("succeeds with multiple API Versions ", async () => {
        let response = await testServer.get("/api/v1/endpoint").expect(200);
        expect(response.text).toEqual("okay");
        response = await testServer.get("/api/v2/endpoint").expect(200);
        expect(response.text).toEqual("okay");
    });
    it("should fail when trying to access an undefined version", async () => {
        await testServer.get("/api/v3/endpoint").expect(404);
    });
});
//# sourceMappingURL=bootstrap.test.js.map