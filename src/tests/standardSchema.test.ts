import type {Server} from 'node:http';
import request from 'supertest';
import {bootstrapControllers} from '../index';
import {StandardSchemaController} from './util/controllers/StandardSchemaController';

let nativeServer: Server;
let testServer: ReturnType<typeof request>;

beforeAll(async () => {
  const {app} = await bootstrapControllers({
    controllers: [StandardSchemaController],
    disableVersioning: true,
    openAPI: {enabled: false}
  });

  nativeServer = app.listen();
  testServer = request(nativeServer);
});

afterAll(done => {
  if (nativeServer.listening) nativeServer.close(done);
  else done();
});

describe('Standard Schema validation', () => {
  it('injects the parsed output from Zod', async () => {
    const response = await testServer
      .post('/standard-schema/orders')
      .send({sku: '  AMALA-1  ', quantity: '2'})
      .expect(200);

    expect(response.body).toEqual({sku: 'AMALA-1', quantity: 2});
  });

  it('lets a schema provide a default for a missing selected value', async () => {
    const response = await testServer
      .get('/standard-schema/pages')
      .expect(200);

    expect(response.body).toEqual({page: 1, type: 'number'});
  });

  it('validates and transforms a selected body property', async () => {
    const response = await testServer
      .post('/standard-schema/orders/sku')
      .send({sku: '  amala-2  '})
      .expect(200);

    expect(response.body).toEqual({sku: 'AMALA-2'});
  });

  it('injects a transformed path parameter', async () => {
    const response = await testServer
      .get('/standard-schema/orders/42')
      .expect(200);

    expect(response.body).toEqual({id: 42, type: 'number'});
  });

  it('supports Valibot without an Amala adapter', async () => {
    const response = await testServer
      .post('/standard-schema/valibot')
      .send({sku: '  VALIBOT-1  '})
      .expect(200);

    expect(response.body).toEqual({sku: 'VALIBOT-1'});
  });

  it('awaits asynchronous Standard Schema validators', async () => {
    const response = await testServer
      .get('/standard-schema/references?ref=order-7')
      .expect(200);

    expect(response.body).toEqual({reference: 'ORDER-7'});
  });

  it('returns normalized issues without exposing input or validator objects', async () => {
    const response = await testServer
      .post('/standard-schema/orders')
      .send({sku: '', quantity: -1})
      .expect(422);

    expect(response.body.message).toBe('validation error for argument type: body');
    expect(response.body.errorDetails).toEqual(expect.arrayContaining([
      expect.objectContaining({
        field: 'sku',
        violations: {standard: expect.any(String)}
      }),
      expect.objectContaining({
        field: 'quantity',
        violations: {standard: expect.any(String)}
      })
    ]));
    expect(JSON.stringify(response.body)).not.toContain('~standard');
    expect(JSON.stringify(response.body)).not.toContain('target');
    expect(JSON.stringify(response.body)).not.toContain('value');
  });

  it('fails closed when a validator throws and hides its exception', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await testServer
      .post('/standard-schema/validator-error')
      .send({secret: 'do not echo'})
      .expect(500);

    expect(response.body).toEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred'
    });
    expect(JSON.stringify(response.body)).not.toContain('private validator details');
    expect(JSON.stringify(response.body)).not.toContain('do not echo');
    log.mockRestore();
  });

  it('bounds issue output and normalizes object path segments', async () => {
    const response = await testServer
      .post('/standard-schema/many-issues')
      .send({})
      .expect(422);

    expect(response.body.errorDetails).toHaveLength(100);
    expect(response.body.errorDetails[0]).toEqual({
      field: 'nested.0',
      violations: {standard: 'Invalid field'}
    });
  });
});
