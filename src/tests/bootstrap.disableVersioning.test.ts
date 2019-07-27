import request from 'supertest';
import Koa from 'koa';
import {bootstrapControllers} from '../index';
import {setSomethingStateFlow} from './util/flow/flow';

let app: Koa;
let nativeServer;
let testServer: request.SuperTest<request.Test>;

beforeAll(async () => {
    app = new Koa();

    await bootstrapControllers(app, {
        basePath: '/api',
        controllers: [__dirname + '/util/controllers/**/*.ts'],
        boomifyErrors: true,
        initBodyParser: true,
        versions: ['1', '2'],
        disableVersioning: true // overwrites and cancels versions if present => /apiBase/controller/action
    });

    nativeServer = app.listen();
    testServer = request(nativeServer);
});

afterAll((done) => {
    if (nativeServer.listening) {
        nativeServer.close(done);
    } else {
        done();
    }
});

describe('Bootstrap option', () => {
    describe('disableVersioning', () => {

        it('works', async () => {
            const response = await testServer
                .get('/api/action') // no longer /api/v.../action
                .expect(200);

            expect(response.text).toEqual('okay');
        });

        it('ignores @Version', async () => {
            const response = await testServer
                .get('/api/action/mmm') // no longer /api/v.../action/mmm
                .expect(200);

            expect(response.text).toEqual('mmm');
        });


    });
});

