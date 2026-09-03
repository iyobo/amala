import request from 'supertest';
import {bootstrapControllers, options} from '../index';
import {ArgController} from './util/controllers/ArgController';
import type {Server} from 'node:http';

describe('security-sensitive bootstrap options', () => {
  let nativeServer: Server;
  let testServer: ReturnType<typeof request>;

  beforeAll(async () => {
    const {app} = await bootstrapControllers({
      attachRoutes: true,
      basePath: '/api',
      bodyParser: {multipart: false},
      controllers: [ArgController],
      disableVersioning: true,
      openAPI: {enabled: false}
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

  it('keeps JSON parsing enabled', async () => {
    const payload = {dish: 'amala and ewedu'};

    const response = await testServer
      .post('/api/arg/bodySimple')
      .send(payload)
      .expect(200);

    expect(response.body).toEqual(payload);
  });

  it('honors multipart: false instead of parsing uploads', async () => {
    await testServer
      .post('/api/arg/uploadFile2')
      .field('testFile', 'not parsed')
      .expect(204);
  });

  it('uses a same-origin OpenAPI URL when publicURL is omitted', () => {
    expect(options.openAPI.publicURL).toBe('');
  });
});
