import Boom from '@hapi/boom';

export const unauthorizedFlow = async () => {
  // console.log('running auth flow...')
  throw Boom.unauthorized('401 for life');
};

/**
 * Test middleware that throws an unexpected error
 * @param ctx
 * @param next
 */
export const badFlow = async (ctx, next) => {
  const a: any = {};
  // should fail and throw error.
  a.hello.world = 'whoo';
  await next();
};

export const setSomethingStateFlow = async (ctx, next) => {
  ctx.state.something = 'hahaha';
  await next();
};

export const loginForTest = async (ctx, next) => {
  ctx.state.user = {id: 'avenger1', firstname: 'Tony', lastName: 'Stark'};
  await next();
};

export const setSomethingSessionFlow = async (ctx, next) => {
  if (ctx.session) {
    ctx.session.amala = 'ewedu';
  }
  await next();
};

export const passFlow = async (ctx, next) => {
  await next();
};
