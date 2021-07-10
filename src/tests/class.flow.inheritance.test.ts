import request from "supertest";
import {bootstrapControllers} from "../index";

let nativeServer;
let testServer: request.SuperTest<request.Test>;
beforeAll(async () => {

  const {app, router} = await bootstrapControllers({
    basePath: "/api",
    controllers: [__dirname + "/util/controllers/**/*.ts"],
    versions: ["1", "2"]
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  nativeServer = app.listen();
  testServer = request(nativeServer);
});

afterAll(done => {
  if (nativeServer.listening) {
    nativeServer.close(done);
  } else {
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
    await testServer.get("/api/v2/action/badFlow").expect(500);
    console.error = originalHandler;

  });
});
