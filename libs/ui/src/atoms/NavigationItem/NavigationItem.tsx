import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p12Regular, setCssVar } from '../../primitives';
import { Anchor } from '../../utils';

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

  '@supports not (aspect-ratio: 1 / 1)': {
    position: 'relative',
    paddingTop: '8px',
    paddingBottom: '8px',
    minWidth: '16px',
    '> *': {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
    },
  },
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
    <div css={containerStyles}>
      {onClick ? (
        <button css={styles} onClick={onClick}>
          {styledIcon}
          {children}
        </button>
      ) : (
        <Anchor css={styles} href={href}>
          {styledIcon}
          {children}
        </Anchor>
      )}
    </div>
  );
};
