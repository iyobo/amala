import request from 'supertest';
import Koa from 'koa';
import {bootstrapControllers} from '../index';
import {setSomethingStateFlow} from './util/flow/flow';

let app: Koa;
let nativeServer;
let testServer: request.SuperTest<request.Test>;
beforeAll(async (done) => {
    app = new Koa();

    await bootstrapControllers(app, {
        basePath: '/api',
        controllers: [__dirname + '/util/controllers/**/*.ts'],
        boomifyErrors: true,
        initBodyParser: true,
        versions: ['1', '2'],
        flow: [setSomethingStateFlow]
    });

    nativeServer = app.listen();
    testServer = request(nativeServer);
    done();
});

afterAll((done) => {
    if (nativeServer.listening) {
        nativeServer.close(done);
    } else {
        done();
    }
});

it('Flow can be inherited from bootstrap', async () => {
    const response = await testServer
        .get('/api/v2/action/staten')
        .expect(200);

    expect(response.body.something).toEqual('hahaha');
});
