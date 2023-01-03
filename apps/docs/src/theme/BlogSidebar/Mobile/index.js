import React from 'react';
import Link from '@docusaurus/Link';
import { NavbarSecondaryMenuFiller } from '@docusaurus/theme-common';

function BlogSidebarMobileSecondaryMenu({ sidebar }) {
  const maxPosts = 8;
  return (
    <ul className="menu__list">
      {sidebar.items.slice(0, maxPosts).map((item) => (
        <li key={item.permalink} className="menu__list-item">
          <Link
            isNavLink
            to={item.permalink}
            className="menu__link"
            activeClassName="menu__link--active"
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <>
              {item.title}
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
            </>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MobileWrapper(props) {
  return (
    <NavbarSecondaryMenuFiller
      component={BlogSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}
