import Koa from 'koa';
import request from 'supertest';
import type {Server} from 'node:http';
import {
  AmalaContext,
  AmalaMiddleware,
  bootstrapControllers,
  Controller,
  Flow,
  Get
} from '../index';

interface AppState {
  services: {
    greeting: string;
  };
  user?: {
    id: string;
  };
}

interface ContextExtensions {
  requestId: string;
}

const typedFlow: AmalaMiddleware<AppState, ContextExtensions> = async (
  ctx,
  next
) => {
  ctx.state.services = {greeting: 'hello'};
  ctx.requestId = 'request-12';

  const greeting: string = ctx.state.services.greeting;
  const requestId: string = ctx.requestId;

  await next();
};

const typeSafetyProbe: AmalaMiddleware<AppState, ContextExtensions> = async ctx => {
  // @ts-expect-error Undeclared context properties must not fall back to `any`.
  ctx.notDeclaredByTheApplication = true;
};

@Controller('/typed-context')
class TypedContextController {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private readonly ctx: AmalaContext<AppState, ContextExtensions>
  ) {}

  @Get('/')
  @Flow(typedFlow)
  value() {
    return {
      greeting: this.ctx.state.services.greeting,
      requestId: this.ctx.requestId
    };
  }
}

describe('typed Koa context', () => {
  let server: Server;

  afterEach(done => {
    if (server?.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  it('preserves inferred state and context extensions through bootstrap', async () => {
    const app = new Koa<AppState, ContextExtensions>();

    const bootstrapped = await bootstrapControllers({
      app,
      attachRoutes: true,
      controllers: [TypedContextController],
      disableVersioning: true,
      openAPI: {enabled: false},
      controllerFactory: (ControllerClass, ctx) => {
        const requestId: string = ctx.requestId;
        const greeting: string = ctx.state.services.greeting;
        return new ControllerClass(ctx);
      },
      errorHandler: async (error, ctx) => {
        const requestId: string = ctx.requestId;
        ctx.status = error instanceof Error ? 500 : 520;
      }
    });

    server = bootstrapped.app.listen();

    await request(server)
      .get('/typed-context')
      .expect(200, {greeting: 'hello', requestId: 'request-12'});
  });

  it('uses safe property-free context defaults', () => {
    const middleware: AmalaMiddleware = async ctx => {
      // @ts-expect-error The default context has no arbitrary property bag.
      ctx.arbitrary = 'not allowed';
    };

    expect(middleware).toBeDefined();
  });
});
