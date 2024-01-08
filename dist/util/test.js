"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTestServer = void 0;
const index_1 = require("../index");
const ArgController_1 = require("../tests/util/controllers/ArgController");
const ProtectedController_1 = require("../tests/util/controllers/ProtectedController");
const startTestServer = async () => {
    const port = 4050;
    const { app, router } = await (0, index_1.bootstrapControllers)({
        basePath: "/api",
        controllers: [ArgController_1.ArgController, ProtectedController_1.ProtectedController],
        versions: ["1", "2"],
        openAPI: {
            enabled: true,
            publicURL: `http://localhost:${port}`,
            specPath: 'docs',
            spec: {
                info: {
                    title: 'Testic Service',
                    description: 'A test service'
                }
            }
        }
    });
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.listen(port);
};
exports.startTestServer = startTestServer;
(0, exports.startTestServer)();
//# sourceMappingURL=test.js.map