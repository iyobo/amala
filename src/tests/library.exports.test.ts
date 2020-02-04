import Koa from 'koa';
import { bootstrapControllers, getControllers } from '../index';


let app: Koa;
let nativeServer;
beforeAll(async () => {
    app = new Koa();

    await bootstrapControllers(app, {
        basePath: '/api',
        controllers: [__dirname + '/util/controllers/**/*.ts'],
        boomifyErrors: true,
        initBodyParser: true,
        versions: ['1', '2']
    });

    nativeServer = app.listen();
});

afterAll((done) => {
    if (nativeServer.listening) {
        nativeServer.close(done);
    } else {
        done();
    }
});

describe.only('library exports', () => {
    it('controllers', async () => {
        const controllers = getControllers();
        expect(controllers).toBeDefined();
        expect(controllers.ActionController).toBeDefined();
        expect(controllers.ArgController).toBeDefined();
        expect(controllers.ProtectedController).toBeDefined();
    });
});
