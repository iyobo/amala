"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passFlow = exports.setSomethingSessionFlow = exports.loginForTest = exports.setSomethingStateFlow = exports.badFlow = exports.unauthorizedFlow = void 0;
const boom_1 = __importDefault(require("@hapi/boom"));
const unauthorizedFlow = async () => {
    // console.log('running auth flow...')
    throw boom_1.default.unauthorized('401 for life');
};
exports.unauthorizedFlow = unauthorizedFlow;
/**
 * Test middleware that throws an unexpected error
 * @param ctx
 * @param next
 */
const badFlow = async (ctx, next) => {
    const a = {};
    // should fail and throw error.
    a.hello.world = 'whoo';
    await next();
};
exports.badFlow = badFlow;
const setSomethingStateFlow = async (ctx, next) => {
    ctx.state.something = 'hahaha';
    await next();
};
exports.setSomethingStateFlow = setSomethingStateFlow;
const loginForTest = async (ctx, next) => {
    ctx.state.user = { id: 'avenger1', firstname: 'Tony', lastName: 'Stark' };
    await next();
};
exports.loginForTest = loginForTest;
const setSomethingSessionFlow = async (ctx, next) => {
    if (ctx.session) {
        ctx.session.amala = 'ewedu';
    }
    await next();
};
exports.setSomethingSessionFlow = setSomethingSessionFlow;
const passFlow = async (ctx, next) => {
    await next();
};
exports.passFlow = passFlow;
//# sourceMappingURL=flow.js.map