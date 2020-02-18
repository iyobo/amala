import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import request from "supertest";
import { bootstrapControllers } from "../index";

let app: Koa;
let router: Router;
let nativeServer;
let testServer: request.SuperTest<request.Test>;
beforeAll(async () => {
  app = new Koa();
  router = new Router();

  await bootstrapControllers(app, {
    basePath: "/api",
    controllers: [__dirname + "/util/controllers/**/*.ts"],
    versions: ["1", "2"],
    router: router
  });

  app.use(bodyParser());
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

describe("Controller actions", () => {
  it("Get works", async () => {
    await testServer.get("/api/v2/action").expect(200);
  });

  it("Post works", async () => {
    await testServer.post("/api/v2/action").expect(200);
  });

  it("Put works", async () => {
    await testServer.put("/api/v2/action").expect(200);
  });

  it("Patch works", async () => {
    await testServer.patch("/api/v2/action").expect(200);
  });

  it("Delete works", async () => {
    await testServer.delete("/api/v2/action").expect(200);
  });

  it("current version (v2) of an endpoint works", async () => {
    const response = await testServer.get("/api/v2/action/mmm").expect(200);
    expect(response.text).toEqual("mmm");
  });

  it("old version (v1) of an endpoint works", async () => {
    const response = await testServer.get("/api/v1/action/mmm").expect(200);
    expect(response.text).toEqual("mmm for v1");
  });

  it("old version (v1) of an endpoint with endpoint deprecation message in header", async () => {
    const response = await testServer.get("/api/v1/action/mmm").expect(200);
    expect(response.header.deprecation).toEqual("Do not use");
  });

  it("flows can allow", async () => {
    const response = await testServer
      .get("/api/v1/action/passFlow")
      .expect(200);
    expect(response.text).toEqual("I was allowed");
  });

  it("flows can reject", async () => {
    const response = await testServer
      .get("/api/v1/action/unauthorized")
      .expect(401);
    expect(response.body.message).toEqual("401 for life");
  });

  it("can have multiple flows", async () => {
    const response = await testServer
      .get("/api/v1/action/multiFlow")
      .expect(200);
    expect(response.text).toEqual("multiFlow allowed");
  });

  it("can have multiple paths", async () => {
    Promise.all([
      await testServer.get("/api/v2/multiple1").expect(200),
      await testServer.get("/api/v2/multiple2").expect(200)
    ]);
  });
});
