import Boom from '@hapi/boom';
import type {AmalaMiddleware} from '../../../index';

type TestState = {
  something?: string;
  user?: {
    id: string;
    firstname: string;
    lastName: string;
  };
};

type SessionContext = {
  session?: Record<string, string>;
};

export const unauthorizedFlow = async () => {
  // console.log('running auth flow...')
  throw Boom.unauthorized('401 for life');
};

/**
 * Test middleware that throws an unexpected error
 * @param ctx
 * @param next
 */
export const badFlow: AmalaMiddleware = async (ctx, next) => {
  const a: {hello?: {world: string}} = {};
  // should fail and throw error.
  a.hello!.world = 'whoo';
  await next();
};

export const setSomethingStateFlow: AmalaMiddleware<TestState> = async (ctx, next) => {
  ctx.state.something = 'hahaha';
  await next();
};

export const loginForTest: AmalaMiddleware<TestState> = async (ctx, next) => {
  ctx.state.user = {id: 'avenger1', firstname: 'Tony', lastName: 'Stark'};
  await next();
};

export const setSomethingSessionFlow: AmalaMiddleware<{}, SessionContext> = async (ctx, next) => {
  if (ctx.session) {
    ctx.session.amala = 'ewedu';
  }
  await next();
};

export const passFlow: AmalaMiddleware = async (ctx, next) => {
  await next();
};
