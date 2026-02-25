import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '循序渐进',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        从密码学基础开始，逐步深入椭圆曲线和 ECDSA 算法，
        每个概念都有清晰的解释和示例。
      </>
    ),
  },
  {
    title: '可视化教学',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        嵌入 Desmos 交互式图表，拖拽参数实时观察椭圆曲线变化，
        让抽象的数学概念变得直观易懂。
      </>
    ),
  },
  {
    title: '实战导向',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        包含完整的代码示例和真实案例（如 PS3 私钥泄露事件），
        理论与实践相结合。
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
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
