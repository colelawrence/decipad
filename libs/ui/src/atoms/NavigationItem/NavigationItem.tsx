import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p14Regular, setCssVar } from '../../primitives';
import { Anchor } from '../../utils';
import { useMouseEventNoEffect } from '../../utils/useMouseEventNoEffect';

const containerStyles = css({
  display: 'grid',
  gridTemplateRows: 'minmax(32px, min-content)',
});

const activeStyles = css({
  backgroundColor: cssVar('highlightColor'),
  boxShadow: `0px 0px 0px 8px ${cssVar('highlightColor')}`,
});
const styles = css(p14Regular, {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  display: 'flex',
  alignItems: 'center',
  columnGap: '4px',

  margin: '0 8px',
  width: 'calc(100% - 16px)',

  clipPath: 'inset(0 -8px 0 -8px round 8px)',
  ':hover, :focus': activeStyles,
});

const iconStyles = css(
  setCssVar('currentTextColor', cssVar('normalTextColor')),
  {
    height: 0,
    minHeight: '50%',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    // essentially 50% padding-right
    aspectRatio: '1.5 / 1',
    alignItems: 'start',

    '@supports not (aspect-ratio: 1.5 / 1)': {
      minWidth: '24px',
      paddingRight: '8px',
    },
  }
);

export type NavigationItemProps = {
  readonly children: ReactNode;
  readonly icon?: React.ReactNode;
} & (
  | {
      readonly href: string;
      readonly exact?: boolean;
      readonly onClick?: undefined;
    }
  | {
      readonly onClick: () => void;
      readonly href?: undefined;
      readonly exact?: undefined;
    }
);

export const NavigationItem = ({
  children,
  icon,

  href,
  exact,

  onClick,
}: NavigationItemProps): ReturnType<FC> => {
  const styledIcon = icon && <span css={iconStyles}>{icon}</span>;
  const onButtonClick = useMouseEventNoEffect(onClick);
  return (
    <div css={containerStyles}>
      {onClick ? (
        <button css={styles} onClick={onButtonClick}>
          {styledIcon}
          {children}
        </button>
      ) : (
        <Anchor
          css={styles}
          activeStyles={activeStyles}
          href={href}
          exact={exact}
        >
          {styledIcon}
          {children}
        </Anchor>
      )}
    </div>
  );
};
