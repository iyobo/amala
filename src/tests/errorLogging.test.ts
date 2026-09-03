import request from 'supertest';
import type {Server} from 'node:http';
import {bootstrapControllers, Controller, Get} from '../index';

@Controller('/safe-error-log')
class SafeErrorLogController {
  @Get('/')
  fail(): never {
    throw new Error('authorization=secret-value');
  }
}

describe('default error logging', () => {
  let server: Server;

  afterEach(done => {
    jest.restoreAllMocks();
    if (server?.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  it('does not write raw exception details', async () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const {app} = await bootstrapControllers({
      attachRoutes: true,
      controllers: [SafeErrorLogController],
      disableVersioning: true,
      openAPI: {enabled: false}
    });
    server = app.listen();

    await request(server)
      .get('/safe-error-log')
      .expect(500, {error: 'Internal Server Error'});

    expect(errorLog).toHaveBeenCalledWith(
      'Amala: request failed with status 500'
    );
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain('secret-value');
  });
});
