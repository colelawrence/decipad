/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Example Gallery',
    image: '/docs/img/undraw_docusaurus_mountain.svg',
    description: <>Examples gallery text here.</>,
    href: '/docs/docs/examples',
  },
  {
    title: 'Help articles',
    image: '/docs/img/undraw_docusaurus_tree.svg',
    description: <>(tutorials, videos, ...)</>,
    href: '/docs/blog',
  },
  {
    title: 'Technical Docs',
    image: '/docs/img/undraw_docusaurus_react.svg',
    description: <>(In categories)</>,
    href: '/docs/docs/language',
  },
];

function Feature({ title, image, description, href }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <a href={href}>
          <img className={styles.featureSvg} alt={title} src={image} />
        </a>
      </div>
      <div className="text--center padding-horiz--md">
        <h3>
          <a href={href}>{title}</a>
        </h3>
        <p>
          <a href={href}>{description}</a>
        </p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
