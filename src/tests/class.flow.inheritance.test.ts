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

describe("Controller class", () => {
  it("Flow can be inherited from class", async () => {
    await testServer.get("/api/v2/protected").expect(401);
  });
});
