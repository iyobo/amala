"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
let nativeServer;
beforeAll(async () => {
    const { app, router } = await (0, index_1.bootstrapControllers)({
        basePath: "/api",
        controllers: [__dirname + "/util/controllers/**/*.ts"],
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
describe.only("library exports", () => {
    it("controllers", async () => {
        const controllers = (0, index_1.getControllers)();
        expect(controllers).toBeDefined();
        expect(controllers.EndpointController).toBeDefined();
        expect(controllers.ArgController).toBeDefined();
        expect(controllers.ProtectedController).toBeDefined();
    });
});
//# sourceMappingURL=library.exports.test.js.map