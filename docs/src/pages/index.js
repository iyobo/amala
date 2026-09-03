import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

const controllerExample = `import {Body, Controller, Get, Params, Post} from 'amala';

@Controller('/users')
export class UserController {
  @Get('/:id')
  getOne(@Params('id') id: string) {
    return {id};
  }

  @Post('/')
  create(@Body({required: true}) input: CreateUserInput) {
    return input;
  }
}`;

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Decorator-first. Koa underneath.</p>
          <Heading as="h1" className={styles.heroTitle}>
            Build clear, typed APIs without hiding Koa.
          </Heading>
          <p className={styles.heroSubtitle}>
            Amala turns TypeScript controller classes into versioned REST APIs
            with focused request injection, validation, and OpenAPI support.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/getting-started">
              Start building
            </Link>
            <Link className={styles.secondaryAction} href="https://github.com/iyobo/amala">
              View on GitHub <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className={styles.heroMeta}>Node.js 22+ · TypeScript · MIT licensed</p>
        </div>
        <div className={styles.codePanel}>
          <div className={styles.codePanelLabel}>A controller is the contract</div>
          <CodeBlock language="typescript" title="src/controllers/UserController.ts">
            {controllerExample}
          </CodeBlock>
        </div>
      </div>
    </header>
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
            Configure CORS, input limits, uploads, API docs, authentication,
            and authorization for your deployment. The production guide makes
            every security-sensitive default visible.
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
    ['01', 'Install and run', 'Create the first controller and start a Koa server.', '/docs/getting-started'],
    ['02', 'Configure the app', 'Choose versioning, middleware, parsing, CORS, and OpenAPI behavior.', '/docs/api-spec/bootstrap-controllers'],
    ['03', 'Shape the API', 'Use controller, endpoint, flow, and argument decorators.', '/docs/api-spec/decorators'],
  ];

  return (
    <section className={styles.nextSteps}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>A short path to the first request</p>
          <Heading as="h2">Learn Amala in three steps.</Heading>
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
      title="Typed Koa APIs with decorators"
      description="Build versioned TypeScript APIs on Koa with decorator routing, validation, request injection, and OpenAPI support."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <SecurityCallout />
        <NextSteps />
      </main>
    </Layout>
  );
}
