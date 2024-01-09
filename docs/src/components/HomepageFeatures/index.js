import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'First-class Typescript',
    image: require('@site/static/img/ts.png').default,
    description: (
      <>
        Define your REST API endpoints using ES8 classes and decorators.
      </>
    ),
  },
  {
    title: 'Powered by Koa',
    image: require('@site/static/img/koa.png').default,
    description: (
      <>
        Clean, light and FAST endpoints powered by KoaJS as the fully accessible engine.
      </>
    ),
  },
  {
    title: 'Flexible Architecture',
    image: require('@site/static/img/flex.png').default,
    description: (
      <>
        Just enough structure to get you started, but gets out of your way so you can fully own your code.
      </>
    ),
  },
  {
    title: 'Docker Ready',
    image: require('@site/static/img/docker.png').default,
    description: (
      <>
        <i>Dockerfile</i> and <i>docker-compose</i> files included for fast and easy containerization & deployments.
      </>
    ),
  },
  {
    title: 'Native OpenAPI/Swagger support',
    image: require('@site/static/img/swagger.png').default,
    description: (
      <>
        Generates OpenAPI v3 JSON specs of your API. Also a Swagger UI to view that spec. All in-built.
      </>
    ),
  },
  {
    title: 'Input validation',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Validate injected inputs for your endpoints using class-validators. [More options coming soon!]
      </>
    ),
  },
];

function Feature({Svg, image, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {Svg && <Svg className={styles.featureSvg} role="img" />}
        {image && <img alt="" className={styles.featureSvg} src={image} role="img" />}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
