import request from 'supertest';
import {bootstrapControllers, Controller, Get} from '../index';

@Controller('/factory')
class FactoryController {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly dependency: any) {}

  @Get('/value')
  value() {
    if (this.dependency.state) {
      return {
        source: 'context',
        path: this.dependency.path
      };
    }

    return this.dependency;
  }
}

describe('controllerFactory', () => {
  const servers = [];

  afterEach(done => {
    const server = servers.pop();
    if (server?.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  it('preserves the default constructor-with-context behavior', async () => {
    const {app} = await bootstrapControllers({
      attachRoutes: true,
      controllers: [FactoryController],
      disableVersioning: true,
      openAPI: {enabled: false}
    });
    const server = app.listen();
    servers.push(server);

    const response = await request(server).get('/factory/value').expect(200);

    expect(response.body).toEqual({source: 'context', path: '/factory/value'});
  });

  it('resolves an asynchronous controller instance for each request', async () => {
    const contexts = [];
    const {app} = await bootstrapControllers({
      attachRoutes: true,
      controllers: [FactoryController],
      controllerFactory: async (ControllerClass, ctx) => {
        contexts.push(ctx);
        return new ControllerClass({source: 'container', requestId: ctx.path});
      },
      disableVersioning: true,
      openAPI: {enabled: false}
    });
    const server = app.listen();
    servers.push(server);

    await request(server)
      .get('/factory/value')
      .expect(200, {source: 'container', requestId: '/factory/value'});
    await request(server)
      .get('/factory/value')
      .expect(200, {source: 'container', requestId: '/factory/value'});

    expect(contexts).toHaveLength(2);
    expect(contexts[0]).not.toBe(contexts[1]);
  });

  it('fails closed when the factory does not return an instance', async () => {
    const {app} = await bootstrapControllers({
      attachRoutes: true,
      controllers: [FactoryController],
      controllerFactory: async () => undefined as any,
      disableVersioning: true,
      errorHandler: async (error, ctx) => {
        ctx.status = error.output?.statusCode || 500;
        ctx.body = {message: error.message};
      },
      openAPI: {enabled: false}
    });
    const server = app.listen();
    servers.push(server);

    const response = await request(server).get('/factory/value').expect(500);
    expect(response.body.message).toContain(
      'Controller factory did not return an instance for FactoryController'
    );
  });
});
