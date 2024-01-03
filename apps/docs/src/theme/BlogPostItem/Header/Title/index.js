import React from 'react';
import clsx from 'clsx';
// eslint-disable-next-line import/no-unresolved
import Link from '@docusaurus/Link';
import { useBlogPost } from '@docusaurus/theme-common/internal';

import styles from './styles.module.css';

export default function TitleWrapper({ className }) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const { permalink, title } = metadata;
  const TitleHeading = isBlogPostPage ? 'h1' : 'h2';
  return (
    <TitleHeading className={clsx(styles.title, className)} itemProp="headline">
      {isBlogPostPage ? (
        title
      ) : (
        <Link itemProp="url" to={permalink}>
          {title}
        </Link>
      )}
    </TitleHeading>
  );
}
