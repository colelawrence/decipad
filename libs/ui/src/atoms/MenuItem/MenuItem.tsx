import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { Item } from '@radix-ui/react-dropdown-menu';
import { cssVar, p14Regular } from '../../primitives';

export const menuItemStyles = css(p14Regular, {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',

  padding: '6px',
  borderRadius: '6px',

  backgroundColor: cssVar('backgroundColor'),
  '&:hover, &:focus, &[data-selected="true"]': {
    backgroundColor: cssVar('highlightColor'),
  },
});

const iconWrapperStyles = css({
  height: '16px',
  width: '16px',
});

const childrenWrapperStyles = css({
  flexGrow: 1,
});

export interface MenuItemProps {
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly onSelect?: () => void;
  readonly selected?: boolean;
}

export const MenuItem: FC<MenuItemProps> = ({
  children,
  icon,
  onSelect,
  selected,
}) => {
  return (
    <Item css={menuItemStyles} onSelect={onSelect} data-selected={selected}>
      {icon != null && <span css={iconWrapperStyles}>{icon}</span>}
      <span css={childrenWrapperStyles}>{children}</span>
    </Item>
  );
};
