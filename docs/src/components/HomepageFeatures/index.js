import Heading from '@theme/Heading';
import styles from './styles.module.css';

const features = [
  {
    number: '01',
    title: 'Routes that read like code',
    description: 'Map controller methods to HTTP paths, versions, and middleware without giving up the underlying Koa router.',
  },
  {
    number: '02',
    title: 'Inputs with a narrow shape',
    description: 'Inject the specific body, path, query, state, session, or context value each handler actually needs.',
  },
  {
    number: '03',
    title: 'Validation at the edge',
    description: 'Transform decorated TypeScript classes and run class-validator before application logic receives the value.',
  },
  {
    number: '04',
    title: 'An API others can inspect',
    description: 'Generate an OpenAPI 3 document and Swagger UI from the same metadata that powers the routes.',
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
