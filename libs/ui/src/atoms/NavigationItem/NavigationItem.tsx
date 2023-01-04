import { noop } from '@decipad/utils';
import { css, SerializedStyles } from '@emotion/react';
import { FC, ReactNode, useState } from 'react';
import { useDrop } from 'react-dnd';
import { IconButton } from '..';
import { Ellipsis } from '../../icons';
import { MenuList } from '../../molecules';
import {
  cssVar,
  normalOpacity,
  OpaqueColor,
  p14Regular,
  setCssVar,
  transparency,
  weakOpacity,
} from '../../primitives';
import { Anchor, DNDItemTypes } from '../../utils';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

type DNDType = {
  target: string;
  id: string;
};

export type NavigationItemProps = {
  readonly children: ReactNode;
  readonly backgroundColor?: OpaqueColor | string;
  readonly icon?: React.ReactNode;
  readonly iconStyles?: SerializedStyles;
  readonly wrapperStyles?: SerializedStyles;
  readonly menuItems?: ReactNode[];
  readonly dndInfo?: DNDType;
  readonly isActive?: boolean;
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
  dndInfo,
  menuItems,
  iconStyles = css({ height: 18, width: 18 }),
  wrapperStyles = css({}),
  isActive = false,
  backgroundColor = cssVar('highlightColor'),

  onClick,
}: NavigationItemProps): ReturnType<FC> => {
  const styledIcon = icon && <span css={[iconStylez, iconStyles]}>{icon}</span>;
  const onButtonClick = useEventNoEffect(onClick);
  const [open, setOpen] = useState(false);
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: DNDItemTypes.ICON,
      drop: () => ({ id: dndInfo?.id }),
      canDrop: () => {
        return !!dndInfo && dndInfo.target === DNDItemTypes.ICON;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [dndInfo]
  );
  const maybeRightSide =
    isActive && menuItems ? (
      <MenuList
        root
        dropdown
        align="start"
        side="bottom"
        open={open}
        onChangeOpen={setOpen}
        trigger={
          <div css={workspaceColorActionsStyles}>
            <IconButton
              onClick={noop}
              roleDescription="open menu"
              roundedSquare
              transparent
            >
              <Ellipsis />
            </IconButton>
          </div>
        }
      >
        {menuItems}
      </MenuList>
    ) : null;
  const leftSide = (
    <div aria-label="lefty" css={leftSideStyles}>
      {styledIcon}
      {children}
    </div>
  );
  const weakColor =
    typeof backgroundColor === 'string'
      ? backgroundColor
      : transparency(backgroundColor, weakOpacity).rgba;
  const weakColor2 =
    typeof backgroundColor === 'string'
      ? backgroundColor
      : transparency(backgroundColor, 0.06).rgba;
  const strongColor =
    typeof backgroundColor === 'string'
      ? backgroundColor
      : transparency(backgroundColor, normalOpacity).rgba;
  return (
    <div
      ref={drop}
      css={[
        containerStyles,
        wrapperStyles,
        canDrop &&
          css({
            borderRadius: 5,
            background: `repeating-linear-gradient(
              45deg,
              ${weakColor},
              ${weakColor} 10px,
              ${weakColor2} 10px,
              ${weakColor2} 20px
            )`,
          }),
        canDrop &&
          isOver &&
          css({
            backgroundColor: strongColor,
          }),
      ]}
    >
      {onClick ? (
        <span css={isActive && css({ button: activeStyles(backgroundColor) })}>
          <button
            css={[
              navigationItemButtonStyles(backgroundColor),
              { justifyContent: 'space-between' },
            ]}
            onClick={onButtonClick}
          >
            {leftSide}
            {maybeRightSide}
          </button>
        </span>
      ) : (
        <Anchor
          css={[
            navigationItemButtonStyles(backgroundColor),
            { justifyContent: 'space-between' },
          ]}
          activeStyles={css([isActive && activeStyles(backgroundColor)])}
          href={href}
          exact={exact}
        >
          {leftSide}
          {maybeRightSide}
        </Anchor>
      )}
    </div>
  );
};

const containerStyles = css({
  display: 'grid',
  gridTemplateRows: 'minmax(32px, min-content)',
  gridTemplateColumns: 'minmax(150px, 100%)',
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

const leftSideStyles = css(p14Regular, {
  display: 'inline-flex',
  overflow: 'hidden',

  whiteSpace: 'nowrap',
  alignItems: 'center',
  gap: '10px',
});

const iconStylez = css(
  setCssVar('currentTextColor', cssVar('normalTextColor')),
  {
    minHeight: '50%',
    position: 'relative',

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
