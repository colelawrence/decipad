import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { IconButton } from '..';
import { Ellipsis } from '../../icons';
import {
  cssVar,
  OpaqueColor,
  p14Regular,
  setCssVar,
  transparency,
} from '../../primitives';
import { Anchor } from '../../utils';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

export type NavigationItemProps = {
  readonly children: ReactNode;
  readonly backgroundColor?: OpaqueColor | string;
  readonly icon?: React.ReactNode;
  readonly ellipsisClick?: () => void;
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
  ellipsisClick,
  backgroundColor = cssVar('highlightColor'),

  onClick,
}: NavigationItemProps): ReturnType<FC> => {
  const styledIcon = icon && <span css={iconStyles}>{icon}</span>;
  const onButtonClick = useEventNoEffect(onClick);
  const ellipsisElement =
    typeof ellipsisClick === 'function' ? (
      <div css={workspaceColorActionsStyles}>
        <IconButton
          roleDescription="open menu"
          roundedSquare
          onClick={ellipsisClick}
          transparent
        >
          <Ellipsis />
        </IconButton>
      </div>
    ) : null;
  return (
    <div css={containerStyles}>
      {onClick ? (
        <button
          css={navigationItemButtonStyles(backgroundColor)}
          onClick={onButtonClick}
        >
          {styledIcon}
          {children}
          {ellipsisElement}
        </button>
      ) : (
        <Anchor
          css={navigationItemButtonStyles(backgroundColor)}
          activeStyles={activeStyles(backgroundColor)}
          href={href}
          exact={exact}
        >
          {styledIcon}
          {children}

          {ellipsisElement}
        </Anchor>
      )}
    </div>
  );
};

const containerStyles = css({
  display: 'grid',
  gridTemplateRows: 'minmax(32px, min-content)',
});

const activeStyles = (backgroundColor: OpaqueColor | string) =>
  css({
    backgroundColor:
      typeof backgroundColor === 'string'
        ? backgroundColor
        : transparency(backgroundColor, 0.3).rgba,
    boxShadow: `0px 0px 0px 8px ${
      typeof backgroundColor === 'string'
        ? backgroundColor
        : transparency(backgroundColor, 0.3).rgba
    }`,
  });

const navigationItemButtonStyles = (backgroundColor: OpaqueColor | string) =>
  css(p14Regular, {
    ...setCssVar('currentTextColor', cssVar('normalTextColor')),

    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',

    margin: '0 8px',
    width: 'calc(100% - 16px)',

    clipPath: 'inset(0 -8px 0 -8px round 8px)',
    ':hover, :focus': activeStyles(backgroundColor),
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

const workspaceColorActionsStyles = css({
  position: 'relative',
});
