import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import request from "supertest";
import { bootstrapControllers } from "../index";
import { setSomethingStateFlow } from "./util/flow/flow";

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
    controllers: [__dirname + "/util/controllers/**/*.ts"],
    versions: ["1", "2"],
    flow: [setSomethingStateFlow],
    router: router
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

describe("Bootstrap function", () => {
  describe("Flow", () => {
    it("works", async () => {
      const response = await testServer
        .get("/api/v2/action/staten")
        .expect(200);

      expect(response.body.something).toEqual("hahaha");
    });
  });
});
