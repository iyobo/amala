import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import request from "supertest";
import { bootstrapControllers } from "../index";
import { ActionController } from "./util/controllers/ActionController";
import { ArgController } from "./util/controllers/ArgController";
import { ProtectedController } from "./util/controllers/ProtectedController";

let app: Koa;
let router: Router;
let nativeServer;
let testServer: request.SuperTest<request.Test>;
beforeAll(async () => {
  app = new Koa();
  router = new Router();

  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());

  await bootstrapControllers(app, {
    basePath: "/api",
    controllers: [ActionController, ArgController, ProtectedController],
    versions: ["1", "2"],
    router
  });

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
