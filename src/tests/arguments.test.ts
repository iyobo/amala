import request from "supertest";
import {bootstrapControllers} from "../index";

let nativeServer;
let testServer: request.SuperTest<request.Test>;
beforeAll(async () => {

  const {app, router} = await bootstrapControllers({
    basePath: "/api",
    // eslint-disable-next-line node/no-path-concat
    controllers: [__dirname + "/util/controllers/**/*.ts"],
    versions: ["1", "2"],
    bodyParser: {
      multipart: true
    },
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

describe("Arguments", () => {

  describe("params", () => {
    it("whole object", async () => {
      const response = await testServer
        .post("/api/v2/arg/akara/garri")
        .expect(200);
      expect(response.body.params).toEqual({id: "garri", model: "akara"});
      expect(response.body.id).toEqual("garri");
    });

    it("params key-value", async () => {
      const response = await testServer
        .post("/api/v2/arg/akara/garri")
        .expect(200);
      expect(response.body.id).toEqual("garri");
    });
  });

  describe("body", () => {
    it("whole object can be injected", async () => {
      const payload = {foo: "Ijebu garri is the best for soaking"};
      const response = await testServer
        .post("/api/v2/arg/bodySimple")
        .send(payload)
        .expect(200);
      expect(response.body).toEqual(payload);
    });

    it("can be set with field", async () => {
      const response = await testServer
        .post("/api/v2/arg/bodySimple")
        .field({abc: 123})
        .expect(200);
      expect(response.body.abc).toEqual("123");
    });

    it("specific subfield can be injected", async () => {
      const payload = {foo: "Ijebu garri is the best for soaking"};
      const response = await testServer
        .post("/api/v2/arg/bodySpecific")
        .send(payload)
        .expect(200);
      expect(response.text).toEqual(payload.foo);
    });

    it("Validation succeeds", async () => {
      const payload = {aString: "Ijebu garri is the best for soaking", aNumber: 4};
      const response = await testServer
        .post("/api/v2/arg/body")
        .send(payload)
        .expect(200);
      expect(response.body.aString).toEqual(payload.aString);
      expect(response.body.aNumber).toEqual(payload.aNumber);
    });

    it("validation fails if required but no input", async () => {
      const response = await testServer
        .post("/api/v2/arg/bodyRequired")
        .expect(422);

      expect(response.body.message).toEqual(
        "Body: is required and cannot be null"
      );
    });

    it("validation fails if input not valid", async () => {
      const response = await testServer
        .post("/api/v2/arg/body")
        .send({a: 1, b: 2, c: 3})
        .expect(422);
      expect(response.body.message).toEqual(
        "validation error for argument type: body"
      );
      expect(response.body.errorDetails.length).toEqual(2);
    });

    it("validation fails if input not valid #2", async () => {
      const response = await testServer
        .post("/api/v2/arg/body")
        .send({aString: "Ijebu garri is the best for soaking"})
        .expect(422);
      expect(response.body.message).toEqual(
        "validation error for argument type: body"
      );
      expect(response.body.errorDetails.length).toEqual(1);
      expect(response.body.errorDetails[0].violations.isNumber).toBeDefined();
    });

    it("Using an interface will not validate. Must use class with field decorators", async () => {
      await testServer
        .post("/api/v2/arg/interface")
        .send({aString: "Ijebu garri is the best for soaking"})
        .expect(200);
    });
  });

  describe("state", () => {
    it("works", async () => {
      const response = await testServer.post("/api/v2/arg/state").expect(200);
      expect(response.body.something).toEqual("hahaha");
    });
  });

  describe("currentUser", () => {
    it("works", async () => {
      const response = await testServer.get("/api/v2/arg/user").expect(200);
      expect(response.body.id).toEqual("avenger1");
    });
  });

  describe("header", () => {
    it("works", async () => {
      const response = await testServer
        .post("/api/v2/arg/header")
        .set("foo", "bar")
        .expect(200);
      expect(response.body.foo).toEqual("bar");
    });
  });

  describe("query", () => {
    it("whole", async () => {
      const response = await testServer
        .get("/api/v2/arg/query?amala=ewedu&beans=garri")
        .expect(200);
      expect(response.body.amala).toEqual("ewedu");
      expect(response.body.beans).toEqual("garri");
    });
    it("single field", async () => {
      const response = await testServer
        .get("/api/v2/arg/querySingle?amala=ewedu&beans=garri")
        .expect(200);
      expect(response.text).toEqual("ewedu");
    });
  });

  describe("params", () => {
    it("whole", async () => {
      const response = await testServer
        .get("/api/v2/arg/params/123")
        .expect(200);
      expect(response.body.id).toEqual("123");
    });
    it("single field", async () => {
      const response = await testServer
        .get("/api/v2/arg/paramsSingle/123")
        .expect(200);
      expect(response.text).toEqual("123");
    });
    describe('get casted to', () => {
      it("number", async () => {
        const response = await testServer
          .get("/api/v2/arg/paramsCastNumber/123")
          .expect(200);
        expect(response.body.type).toEqual("number");
        expect(response.body.val).toEqual(123);
      });
      it("boolean", async () => {
        const response = await testServer
          .get("/api/v2/arg/paramsCastBoolean/true")
          .expect(200);
        expect(response.body.type).toEqual("boolean");
        expect(response.body.val).toEqual(true);
      });
    });

  });

  describe("session", () => {
    it("No session by default so fail. Works otherwise like any other ctx field", async () => {
      const response = await testServer.get("/api/v2/arg/session").expect(424);
      expect(response.body.message).toEqual(
        "Sessions have not been activated on this server"
      );
    });
  });

  describe("req", () => {

    it("can set headers", async () => {
      const response = await testServer
        .post("/api/v2/arg/req")
        .set("foo", "bar")
        .expect(200);

      // returns a serialized req object
      // expect(Buffer.isBuffer(response.body)).toEqual(true);
      expect(response.body).toBeDefined();
      expect(response.body.foo).toEqual('bar');
    });

    it("Buffer can be uploaded", async () => {
      const buffer = Buffer.from('some file data');
      const response = await testServer
        .post("/api/v2/arg/uploadBuffer")
        .set("foo", "bar")
        .attach('testFile', buffer)
        .expect(200);

      // returns a serialized req object
      expect(response.body).toEqual({testFile: 'some file data'});
    });

    it("File decorator injects files", async () => {

      const response = await testServer
        .post("/api/v2/arg/uploadFile")
        .set("foo", "bar")
        .attach('testFile', 'src/tests/attachments/image.png')
        .expect(200);

      // returns a serialized req object
      expect(response.body.testFile).toBeDefined();
      expect(response.body.testFile.name).toEqual('image.png');
      expect(response.body.testFile.type).toEqual('image/png');
      expect(response.body.testFile.size).toEqual(41569);
    });

    it("Uploaded files can also be found in @Req.files", async () => {

      const response = await testServer
        .post("/api/v2/arg/uploadFile2")
        .set("foo", "bar")
        .attach('testFile', 'src/tests/attachments/image.png')
        .expect(200);

      // returns a serialized req object
      expect(response.body.testFile).toBeDefined();
      expect(response.body.testFile.name).toEqual('image.png');
      expect(response.body.testFile.type).toEqual('image/png');
      expect(response.body.testFile.size).toEqual(41569);
    });

  });

  describe("res", () => {
    it("works", async () => {
      const response = await testServer
        .post("/api/v2/arg/res")
        .set("foo", "bar")
        .expect(200);

      // returns a serialized res object
      expect(response.text).toEqual("works");
    });
  });

  describe("ctx", () => {

    it("injects itself", async () => {
      const response = await testServer
        .post("/api/v2/arg/ctx")
        .set("foo", "bar")
        .expect(200);

      // returns a serialized ctx object
      expect(response.body.app).toBeDefined();
      expect(response.body.app.env).toBeDefined();
    });

    it("injects child fields", async () => {
      const response = await testServer
        .get("/api/v2/arg/ctx2?jollof=rice")
        .expect(200);

      // returns a serialized ctx object
      expect(response.body).toBeDefined();
      expect(response.body.jollof).toEqual('rice');
    });

    it("Can be used to make custom decorators", async () => {
      const response = await testServer
        .get("/api/v2/arg/custom?jollof=rice")
        .expect(200);

      // returns a serialized ctx object
      expect(response.body).toBeDefined();
      expect(response.body.jollof).toEqual('rice');
    });

  });

  describe("multiple paths", () => {
    it("work 1", async () => {
      const response = await testServer
        .get("/api/v2/arg/multiPath1?jollof=rice")
        .expect(200);

      // returns a serialized ctx object
      expect(response.body).toBeDefined();
      expect(response.body.jollof).toEqual('rice');
    });

    it("work 2", async () => {
      const response = await testServer
        .get("/api/v2/arg/multiPath2?jollof=beans")
        .expect(200);

      // returns a serialized ctx object
      expect(response.body).toBeDefined();
      expect(response.body.jollof).toEqual('beans');
    });
  });

});
