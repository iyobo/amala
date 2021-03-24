import request from "supertest";
import {bootstrapControllers} from "../index";
import {ActionController} from "./util/controllers/ActionController";
import {ArgController} from "./util/controllers/ArgController";
import {ProtectedController} from "./util/controllers/ProtectedController";

let nativeServer;
let testServer: request.SuperTest<request.Test>;
beforeAll(async () => {

  const {app, router} = await bootstrapControllers({
    basePath: "/api",
    controllers: [ActionController, ArgController, ProtectedController],
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

describe("bootstrapping server", () => {
  it("should succeed ", async () => {
    const response = await testServer.get("/api/v2/action").expect(200);
    expect(response.text).toEqual("okay");
  });

  it("succeeds with multiple API Versions ", async () => {
    let response = await testServer.get("/api/v1/action").expect(200);
    expect(response.text).toEqual("okay");

    response = await testServer.get("/api/v2/action").expect(200);
    expect(response.text).toEqual("okay");
  });

  it("should fail when trying to access an undefined version", async () => {
    await testServer.get("/api/v3/action").expect(404);
  });
});
