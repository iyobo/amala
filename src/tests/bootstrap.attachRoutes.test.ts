import request from 'supertest';
import type {Server} from 'node:http';
import {
  bootstrapControllers,
  Controller,
  Get,
  options
} from '../index';

@Controller('/route-attachment')
class RouteAttachmentController {
  @Get('/')
  status() {
    return {attached: true};
  }
}

describe('route attachment', () => {
  const servers: Server[] = [];

  afterEach(done => {
    const server = servers.pop();
    if (server?.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  it('attaches generated routes by default', async () => {
    const {app} = await bootstrapControllers({
      controllers: [RouteAttachmentController],
      disableVersioning: true,
      openAPI: {enabled: false}
    });
    const server = app.listen();
    servers.push(server);

    expect(options.attachRoutes).toBe(true);
    await request(server)
      .get('/route-attachment')
      .expect(200, {attached: true});
  });

  it('leaves routes unmounted when explicitly disabled', async () => {
    const {app} = await bootstrapControllers({
      attachRoutes: false,
      controllers: [RouteAttachmentController],
      disableVersioning: true,
      openAPI: {enabled: false}
    });
    const server = app.listen();
    servers.push(server);

    expect(options.attachRoutes).toBe(false);
    await request(server).get('/route-attachment').expect(404);
  });

  it('returns the generated router for manual composition', async () => {
    const {app, router} = await bootstrapControllers({
      attachRoutes: false,
      controllers: [RouteAttachmentController],
      disableVersioning: true,
      openAPI: {enabled: false}
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    const server = app.listen();
    servers.push(server);
    await request(server)
      .get('/route-attachment')
      .expect(200, {attached: true});
  });
});
