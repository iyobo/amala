import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import { bootstrapControllers, getControllers } from "../index";

let app: Koa;
let router: Router;
let nativeServer;
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
    expect(controllers.ActionController).toBeDefined();
    expect(controllers.ArgController).toBeDefined();
    expect(controllers.ProtectedController).toBeDefined();
  });
});
