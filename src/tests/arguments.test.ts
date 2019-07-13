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

describe('Arguments', () => {

    describe('params', () => {
        it('whole object', async () => {
            const response = await testServer
                .post('/api/v2/arg/akara/garri')
                .expect(200);
            expect(response.body.params).toEqual( {id: 'garri', model: 'akara'});
        });

        it('params key-value', async () => {
            const response = await testServer
                .post('/api/v2/arg/akara/garri')
                .expect(200);
            expect(response.body.id).toEqual( 'garri');
        });
    });


    describe('body', () => {
        it('validation fails if required and not provided', async () => {
            const response = await testServer
                .post('/api/v2/arg/bodyRequired')
                .expect(422);
            expect(response.body.message).toEqual( 'Body: is required and cannot be null');
        });

        it('validation fails if input validation does not match', async () => {
            const response = await testServer
                .post('/api/v2/arg/body')
                .send({a:1,b:2,c:3})
                .expect(422);
            expect(response.body.message).toEqual( 'Body: is required and cannot be null');
        });
    });

});
