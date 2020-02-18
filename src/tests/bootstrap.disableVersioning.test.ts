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

  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());

  await bootstrapControllers(app, {
    basePath: "/api",
    controllers: [__dirname + "/util/controllers/**/*.ts"],
    versions: ["1", "2"],
    disableVersioning: true, // overwrites and cancels versions if present => /apiBase/controller/action
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

describe("Bootstrap option", () => {
  describe("disableVersioning", () => {
    it("works", async () => {
      const response = await testServer
        .get("/api/action") // no longer /api/v.../action
        .expect(200);

      expect(response.text).toEqual("okay");
    });

    it("ignores @Version", async () => {
      const response = await testServer
        .get("/api/action/mmm") // no longer /api/v.../action/mmm
        .expect(200);

      expect(response.text).toEqual("mmm");
    });
  });
});
