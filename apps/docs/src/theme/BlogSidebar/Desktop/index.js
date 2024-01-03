import React from 'react';

import clsx from 'clsx';
// eslint-disable-next-line import/no-unresolved
import Link from '@docusaurus/Link';
// eslint-disable-next-line import/no-unresolved
import { translate } from '@docusaurus/Translate';

import styles from './styles.module.css';

export default function DesktopWrapper(props) {
  const maxPosts = 8;
  return (
    <>
      <aside className="col col--3">
        <nav
          className={clsx(styles.sidebar, 'thin-scrollbar')}
          aria-label={translate({
            id: 'theme.blog.sidebar.navAriaLabel',
            message: 'Blog recent posts navigation',
            description: 'The ARIA label for recent posts in the blog sidebar',
          })}
        >
          <div className={clsx(styles.sidebarItemTitle, 'margin-bottom--md')}>
            {props.sidebar.title}
          </div>

          <ul className={clsx(styles.sidebarItemList, 'clean-list')}>
            {props.sidebar.items.slice(0, maxPosts).map((item) => (
              <li key={item.permalink} className={styles.sidebarItem}>
                <Link
                  isNavLink
                  to={item.permalink}
                  className={styles.sidebarItemLink}
                  activeClassName={styles.sidebarItemLinkActive}
                >
                  {item.title}
                  <br></br>
                  <time
                    dateTime={item.date}
                    itemProp="datePublished"
                    style={{
                      color: 'darkgray',
                      fontSize: '0.8em',
                      fontWeight: '400',
                    }}
                  >
                    {item.formattedDate}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
