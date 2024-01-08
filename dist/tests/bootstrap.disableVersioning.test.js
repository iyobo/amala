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
        versions: ["1", "2"],
        disableVersioning: true, // overwrites and cancels versions if present => /apiBase/controller/endpoint
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
describe("Bootstrap option", () => {
    describe("disableVersioning", () => {
        it("works", async () => {
            const response = await testServer
                .get("/api/endpoint") // no longer /api/v.../endpoint
                .expect(200);
            expect(response.text).toEqual("okay");
        });
        it("ignores @Version", async () => {
            const response = await testServer
                .get("/api/endpoint/mmm") // no longer /api/v.../endpoint/mmm
                .expect(200);
            expect(response.text).toEqual("mmm");
        });
    });
});
//# sourceMappingURL=bootstrap.disableVersioning.test.js.map