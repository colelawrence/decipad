import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p12Regular, setCssVar } from '../../primitives';

const containerStyles = css({
  display: 'grid',
  gridTemplateRows: 'minmax(32px, min-content)',
});
const styles = css(p12Regular, {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  display: 'flex',
  alignItems: 'center',
  columnGap: '8px',

  ':hover, :focus': {
    backgroundColor: cssVar('highlightColor'),
    boxShadow: `0px 0px 0px 8px ${cssVar('highlightColor')}`,
    clipPath: 'inset(0 -8px 0 -8px round 8px)',
  },
});
const iconStyles = css({
  height: 0,
  minHeight: '50%',
  aspectRatio: '1 / 1',

  display: 'flex',
  alignItems: 'center',
});

export type NavigationItemProps = {
  readonly children: ReactNode;
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
  const styledIcon = icon && <span css={iconStyles}>{icon}</span>;
  return (
    <li css={containerStyles}>
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
