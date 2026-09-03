"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
let nativeServer;
beforeAll(async () => {
    const { app, router } = await (0, index_1.bootstrapControllers)({
        attachRoutes: false,
        basePath: "/api",
        controllers: [path_1.default.join(__dirname, "util/controllers/**/*.ts")],
        versions: ["1", "2"]
    });
    app.use(router.routes());
    app.use(router.allowedMethods());
    nativeServer = app.listen();
});
afterAll(done => {
    if (nativeServer.listening) {
        nativeServer.close(done);
    }
    else {
        done();
    }
});
describe("library exports", () => {
    it("controllers", async () => {
        const controllers = (0, index_1.getControllers)();
        expect(controllers).toBeDefined();
        expect(controllers.EndpointController).toBeDefined();
        expect(controllers.ArgController).toBeDefined();
        expect(controllers.ProtectedController).toBeDefined();
    });
});
//# sourceMappingURL=library.exports.test.js.map