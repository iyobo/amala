import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

const contextExample = `import Koa from 'koa';
import {bootstrapControllers} from 'amala';

interface State {
  user?: User;
  services: Services;
}

interface Context {
  requestId: string;
}

const app = new Koa<State, Context>();

await bootstrapControllers({
  app,
  controllers: [UserController],
});`;

const contextUsage = `type AppContext = AmalaContext<State, Context>;

const authorize: AmalaMiddleware<State, Context> =
  async (ctx, next) => {
    ctx.state.user = await authenticate(ctx);
    ctx.requestId = crypto.randomUUID();

    // Fully typed in middleware, factories,
    // error handlers, and returned app/router.
    await next();
  };`;

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <Link className={styles.releasePill} to="/docs/migration-v12">
            <span className={styles.releaseDot} aria-hidden="true" />
            Amala 12 is here
            <span aria-hidden="true">↗</span>
          </Link>
          <Heading as="h1" className={styles.heroTitle}>
            Keep Koa.
            <span>Add a contract.</span>
          </Heading>
          <p className={styles.heroSubtitle}>
            A small TypeScript layer for controller routing, validation, and
            OpenAPI—now carrying your Koa state and context types end to end.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/getting-started">
              Start with v12
            </Link>
            <Link className={styles.secondaryAction} to="/docs/migration-v12">
              Migrate from v11 <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className={styles.heroFacts} aria-label="Project details">
            <li>Node.js 22+</li>
            <li>Koa 3</li>
            <li>MIT licensed</li>
          </ul>
        </div>
        <div className={styles.codeStack}>
          <div className={styles.codeShadow} aria-hidden="true" />
          <div className={styles.codePanel}>
            <div className={styles.codePanelHeader}>
              <span className={styles.windowDots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>src/main.ts</span>
              <span className={styles.codeVersion}>v12</span>
            </div>
            <CodeBlock language="typescript">{contextExample}</CodeBlock>
          </div>
        </div>
      </div>
      <div className={`container ${styles.releaseRail}`}>
        <div>
          <strong>Typed context</strong>
          <span>No implicit property bag</span>
        </div>
        <div>
          <strong>Koa-native</strong>
          <span>Your middleware model stays intact</span>
        </div>
        <div>
          <strong>Intentionally small</strong>
          <span>No container or binding framework</span>
        </div>
      </div>
    </header>
  );
}
function ContextSpotlight() {
  return (
    <section className={styles.contextSpotlight} aria-labelledby="context-heading">
      <div className={`container ${styles.contextGrid}`}>
        <div className={styles.contextCopy}>
          <p className={styles.eyebrow}>The v12 idea</p>
          <Heading id="context-heading" as="h2">
            The context you already use, with types that follow it everywhere.
          </Heading>
          <p>
            Define Koa state and context extensions once. Amala preserves them
            through middleware, controller creation, error handling, and the
            app and router it returns.
          </p>
          <div className={styles.contextNotes}>
            <div>
              <span>01</span>
              <p><strong>Compile-time guardrails.</strong> Undeclared context properties stop becoming silent <code>any</code> values.</p>
            </div>
            <div>
              <span>02</span>
              <p><strong>No new runtime model.</strong> Koa remains Koa; application middleware still owns application state.</p>
            </div>
          </div>
          <Link className={styles.inlineLinkDark} to="/docs/migration-v12">
            Read the v12 migration guide <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={styles.contextCode}>
          <CodeBlock language="typescript" title="One shared context contract">
            {contextUsage}
          </CodeBlock>
        </div>
      </div>
    </section>
  );
}

function SecurityCallout() {
  return (
    <section className={styles.securityBand}>
      <div className={`container ${styles.securityGrid}`}>
        <div>
          <p className={styles.eyebrow}>Own the boundary</p>
          <Heading as="h2">Framework convenience, explicit security.</Heading>
        </div>
        <div>
          <p>
            Types prevent accidental access; they do not authenticate users or
            validate values at runtime. Amala validates request inputs while
            your middleware owns identity, authorization, and application state.
          </p>
          <Link className={styles.inlineLink} to="/docs/security">
            Review the security guide <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function NextSteps() {
  const steps = [
    ['01', 'Start a v12 API', 'Define a controller, type the Koa context, and serve the first request.', '/docs/getting-started'],
    ['02', 'Move from v11', 'See every breaking type change and the smallest migration path.', '/docs/migration-v12'],
    ['03', 'Ship deliberately', 'Review parsing, CORS, OpenAPI, authentication, and production defaults.', '/docs/security'],
  ];

  return (
    <section className={styles.nextSteps}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Choose your path</p>
          <Heading as="h2">From first route to production boundary.</Heading>
        </div>
        <div className={styles.stepsGrid}>
          {steps.map(([number, title, description, to]) => (
            <Link className={styles.stepCard} to={to} key={number}>
              <span className={styles.stepNumber}>{number}</span>
              <Heading as="h3">{title}</Heading>
              <p>{description}</p>
              <span className={styles.cardLink} aria-hidden="true">Open guide →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Keep Koa. Add a contract."
      description="Amala 12 is a small TypeScript framework for typed Koa context, controller routing, validation, versioning, and OpenAPI."
    >
      <HomepageHeader />
      <main>
        <ContextSpotlight />
        <HomepageFeatures />
        <SecurityCallout />
        <NextSteps />
      </main>
    </Layout>
  );
}
