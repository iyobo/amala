import request from 'supertest';
import Koa from 'koa';
import {bootstrapControllers} from '../index';

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
        versions: ['1', '2']
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

describe('Controller actions', () => {

    it('Get works', async () => {
        const response = await testServer
            .get('/api/v2/action')
            .expect(200);
    });

    it('Post works', async () => {
        const response = await testServer
            .post('/api/v2/action')
            .expect(200);
    });

    it('Put works', async () => {
        const response = await testServer
            .put('/api/v2/action')
            .expect(200);
    });

    it('Patch works', async () => {
        const response = await testServer
            .patch('/api/v2/action')
            .expect(200);
    });

    it('Delete works', async () => {
        const response = await testServer
            .delete('/api/v2/action')
            .expect(200);
    });

    it('current version (v2) of an endpoint works', async () => {
        const response = await testServer
            .get('/api/v2/action/mmm')
            .expect(200);
        expect(response.text).toEqual('mmm');

    });

    it('old version (v1) of an endpoint works', async () => {

        const response = await testServer
            .get('/api/v1/action/mmm')
            .expect(200);
        expect(response.text).toEqual('mmm for v1');
    });

    it('flows can allow', async () => {

        const response = await testServer
            .get('/api/v1/action/passFlow')
            .expect(200);
        expect(response.text).toEqual('I was allowed');
    });

    it('flows can reject', async () => {

        const response = await testServer
            .get('/api/v1/action/unauthorized')
            .expect(401);
        expect(response.body.message).toEqual('401 for life');
    });

    it('can have multiple flows', async () => {

        const response = await testServer
            .get('/api/v1/action/multiFlow')
            .expect(200);
        expect(response.text).toEqual('multiFlow allowed');
    });


});
