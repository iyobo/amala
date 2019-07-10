const Boom = require('boom');

export const unauthorizedFlow = async (ctx, next) => {

    throw Boom.unauthorized('401 for life');
};

export const setSomethingStateFlow = async (ctx, next) => {

   ctx.state.something = 'hahaha';
   await next();
};

export const passFlow = async (ctx, next) => {

   await next();
};

