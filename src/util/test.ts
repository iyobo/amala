import {bootstrapControllers} from '../index';
import {ActionController} from '../tests/util/controllers/ActionController';
import {ArgController} from '../tests/util/controllers/ArgController';
import {ProtectedController} from '../tests/util/controllers/ProtectedController';
import request from 'supertest';

export const startTestServer = async ()=> {
  const port = 4050
  const {app, router} = await bootstrapControllers({
    basePath: "/api",
    controllers: [ArgController, ProtectedController],
    versions: ["1", "2"],
    openAPI:{
      enabled: true,
      publicURL: `http://localhost:${port}`,
      spec: {
        info:{
          title: 'Testic Service',
          description: 'A test service'
        }
      }
    }
  });

  app.use(router.routes());

  app.use(router.allowedMethods());

  app.listen(port);
}

startTestServer()