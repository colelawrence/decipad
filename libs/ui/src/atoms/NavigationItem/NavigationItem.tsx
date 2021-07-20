import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p12Regular, setCssVar } from '../../primitives';

import { TextChildren } from '../../utils';

const styles = css(p12Regular, {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  height: '32px',

  display: 'flex',
  alignItems: 'center',
  columnGap: '8px',

  ':hover, :focus': {
    backgroundColor: cssVar('highlightColor'),
    boxShadow: `0px 0px 0px 8px ${cssVar('highlightColor')}`,
    clipPath: 'inset(0 -8px 0 -8px round 8px)',
  },
});

export type NavigationItemProps = {
  readonly children: TextChildren;
  readonly icon?: React.ReactNode;
} & (
  | {
      readonly href: string;
      readonly onClick?: undefined;
    }
  | {
      readonly onClick: () => void;
      readonly href?: undefined;
    }
);

export const NavigationItem = ({
  children,
  href,
  icon,
  onClick,
}: NavigationItemProps): ReturnType<FC> => {
  const styledIcon = icon && (
    <span css={{ height: '50%', aspectRatio: '1 / 1', display: 'flex' }}>
      {icon}
    </span>
  );
  return (
    <li css={{ display: 'grid' }}>
      {onClick ? (
        <button css={styles} onClick={onClick}>
          {styledIcon}
          {children}
        </button>
      ) : (
        <a css={styles} href={href}>
          {styledIcon}
          {children}
        </a>
      )}
    </li>
  );
};
