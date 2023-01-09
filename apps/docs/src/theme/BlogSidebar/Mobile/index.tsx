import React from 'react';
// eslint-disable-next-line import/no-unresolved
import Link from '@docusaurus/Link';
import { NavbarSecondaryMenuFiller } from '@docusaurus/theme-common';

interface SidebarItem {
  permalink: string;
  date: string;
  title: string;
  formattedDate: string;
}

interface SidebarMobileSecondaryMenuProps {
  sidebar: {
    items: SidebarItem[];
  };
}

function BlogSidebarMobileSecondaryMenu({
  sidebar,
}: SidebarMobileSecondaryMenuProps): JSX.Element {
  const maxPosts = 8;
  return (
    <ul className="menu__list">
      {sidebar.items.slice(0, maxPosts).map((item) => (
        <li key={item.permalink} className="menu__list-item">
          <Link
            isNavLink
            to={item.permalink}
            className="menu__link"
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

export default function MobileWrapper(props: SidebarMobileSecondaryMenuProps) {
  return (
    <NavbarSecondaryMenuFiller
      component={BlogSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}
