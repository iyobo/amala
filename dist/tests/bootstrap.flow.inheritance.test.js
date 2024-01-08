"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const flow_1 = require("./util/flow/flow");
let nativeServer;
let testServer;
beforeAll(async () => {
    const { app, router } = await (0, index_1.bootstrapControllers)({
        basePath: "/api",
        controllers: [__dirname + "/util/controllers/**/*.ts"],
        versions: ["1", "2"],
        flow: [flow_1.setSomethingStateFlow],
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
describe("Bootstrap function", () => {
    describe("Flow", () => {
        it("works", async () => {
            const response = await testServer
                .get("/api/v2/endpoint/staten")
                .expect(200);
            expect(response.body.something).toEqual("hahaha");
        });
    });
});
//# sourceMappingURL=bootstrap.flow.inheritance.test.js.map