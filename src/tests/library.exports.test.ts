import {bootstrapControllers, getControllers} from "../index";

let nativeServer;
beforeAll(async () => {

  const {app, router} = await bootstrapControllers({
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
  } else {
    done();
  }
});

describe.only("library exports", () => {
  it("controllers", async () => {
    const controllers = getControllers();
    expect(controllers).toBeDefined();
    expect(controllers.EndpointController).toBeDefined();
    expect(controllers.ArgController).toBeDefined();
    expect(controllers.ProtectedController).toBeDefined();
  });
});
