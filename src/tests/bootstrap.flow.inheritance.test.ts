import request from "supertest";
import {bootstrapControllers} from "../index";
import {setSomethingStateFlow} from "./util/flow/flow";

let nativeServer;
let testServer: request.SuperTest<request.Test>;

beforeAll(async () => {


  const {app, router} = await bootstrapControllers({
    basePath: "/api",
    controllers: [__dirname + "/util/controllers/**/*.ts"],
    versions: ["1", "2"],
    flow: [setSomethingStateFlow],
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

describe("Bootstrap function", () => {
  describe("Flow", () => {
    it("works", async () => {
      const response = await testServer
        .get("/api/v2/endpoint/staten")
        .expect(200);

      expect(response.body.something).toEqual("hahaha");
    });
  });
});
