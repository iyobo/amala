import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const features = [
  {
    number: '01',
    title: 'Routes that read like code',
    description: 'A controller prefix and an HTTP decorator become a real Koa route. Bootstrap mounts it and returns the app.',
    codeTitle: 'GET /v1/users/:id',
    code: `@Controller('/users')
class UserController {
  @Get('/:id')
  getOne(@Params('id') id: string) {
    return {id};
  }
}

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [UserController],
  });
  app.listen(3000);
}

void main();`,
  },
  {
    number: '02',
    title: 'Inputs with a narrow shape',
    description: 'Inject only what a handler needs. The method signature documents the request instead of hiding it in context access.',
    codeTitle: 'GET /v1/search?q=amala',
    code: `@Controller('/search')
class SearchController {
  @Get('/')
  find(@Query('q') query?: string) {
    return {query};
  }
}

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [SearchController],
  });
  app.listen(3000);
}

void main();`,
  },
  {
    number: '03',
    title: 'Validation at the edge',
    description: 'A decorated class becomes a runtime request boundary, with strict unknown-field handling selected at bootstrap.',
    codeTitle: 'POST /v1/users',
    code: `class CreateUserInput {
  @IsEmail()
  email!: string;
}

@Controller('/users')
class UserController {
  @Post('/')
  create(@Body({required: true}) input: CreateUserInput) {
    return input;
  }
}

async function main() {
  const {app} = await bootstrapControllers({
    controllers: [UserController],
    validatorOptions: {
      forbidNonWhitelisted: true,
      whitelist: true,
    },
  });
  app.listen(3000);
}

void main();`,
  },
  {
    number: '04',
    title: 'An API others can inspect',
    description: 'Configure the generated OpenAPI document beside the controllers it describes. Swagger stays on the same origin.',
    codeTitle: 'OpenAPI at /api/docs',
    code: `async function main() {
  const {app} = await bootstrapControllers({
    basePath: '/api',
    controllers: [UserController],
    openAPI: {
      spec: {
        info: {
          title: 'Example API',
          version: '1.0.0',
        },
      },
    },
  });
  app.listen(3000);
}

void main();`,
  },
];

export default function HomepageFeatures() {
  return (
    <section className={styles.features} aria-labelledby="capabilities-heading">
      <div className="container">
        <div className={styles.heading}>
          <p>Small framework surface</p>
          <Heading id="capabilities-heading" as="h2">
            Structure where it helps. Control where it matters.
          </Heading>
        </div>
        <div className={styles.grid}>
          {features.map(feature => (
            <article className={styles.card} key={feature.number}>
              <span className={styles.number}>{feature.number}</span>
              <Heading as="h3">{feature.title}</Heading>
              <p>{feature.description}</p>
              <div className={styles.example}>
                <CodeBlock language="typescript" title={feature.codeTitle}>
                  {feature.code}
                </CodeBlock>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
