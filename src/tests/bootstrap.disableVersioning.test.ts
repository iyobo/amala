import request from "supertest";
import {bootstrapControllers} from "../index";

let nativeServer;
let testServer: request.SuperTest<request.Test>;

beforeAll(async () => {

  const {app, router} = await bootstrapControllers({
    basePath: "/api",
    controllers: [__dirname + "/util/controllers/**/*.ts"],
    versions: ["1", "2"],
    disableVersioning: true, // overwrites and cancels versions if present => /apiBase/controller/endpoint
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

describe("Bootstrap option", () => {
  describe("disableVersioning", () => {
    it("works", async () => {
      const response = await testServer
        .get("/api/endpoint") // no longer /api/v.../endpoint
        .expect(200);

      expect(response.text).toEqual("okay");
    });

    it("ignores @Version", async () => {
      const response = await testServer
        .get("/api/endpoint/mmm") // no longer /api/v.../endpoint/mmm
        .expect(200);

      expect(response.text).toEqual("mmm");
    });
  });
});
