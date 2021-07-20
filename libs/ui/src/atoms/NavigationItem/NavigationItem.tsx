import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p12Bold, p12Medium } from '../../primitives';

import { TextChildren } from '../../utils';

const styles = css(p12Medium, {
  padding: '0 12px',
  height: '32px',

  display: 'flex',
  alignItems: 'center',
  columnGap: '8px',

  borderRadius: '8px',
  ':hover, :focus': {
    ...p12Bold,
    backgroundColor: cssVar('highlightColor'),
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
