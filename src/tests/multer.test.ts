import multer from '@koa/multer';
import request from 'supertest';
import {bootstrapControllers, Controller, File, Flow, Post} from '../index';
import type {Server} from 'node:http';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 1024}
});

@Controller('/multer')
class MulterController {
  @Flow([upload.single('image')])
  @Post('/single')
  single(@File() file: multer.File) {
    return {
      fieldname: file.fieldname,
      originalname: file.originalname,
      size: file.size
    };
  }

  @Flow([upload.fields([{name: 'image', maxCount: 1}])])
  @Post('/fields')
  fields(@File() files: Record<string, multer.File[]>) {
    return {
      fieldname: files.image[0].fieldname,
      originalname: files.image[0].originalname,
      size: files.image[0].size
    };
  }
}

describe('@koa/multer support', () => {
  let nativeServer: Server;
  let testServer: ReturnType<typeof request>;

  beforeAll(async () => {
    const {app} = await bootstrapControllers({
      attachRoutes: true,
      bodyParser: false,
      controllers: [MulterController],
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

  it('injects a single file from ctx.request.file', async () => {
    const response = await testServer
      .post('/multer/single')
      .attach('image', Buffer.from('amala'), 'amala.txt')
      .expect(200);

    expect(response.body).toEqual({
      fieldname: 'image',
      originalname: 'amala.txt',
      size: 5
    });
  });

  it('preserves multiple-file injection from ctx.request.files', async () => {
    const response = await testServer
      .post('/multer/fields')
      .attach('image', Buffer.from('amala'), 'amala.txt')
      .expect(200);

    expect(response.body).toEqual({
      fieldname: 'image',
      originalname: 'amala.txt',
      size: 5
    });
  });
});
