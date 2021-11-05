import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { Item } from '@radix-ui/react-dropdown-menu';
import { cssVar, p14Regular } from '../../primitives';

export const menuItemStyles = css(p14Regular, {
  display: 'flex',
  alignItems: 'center',
  borderRadius: '6px',
  gap: '4px',
  padding: '6px',

  backgroundColor: cssVar('backgroundColor'),
  '&:hover, &:focus': {
    backgroundColor: cssVar('highlightColor'),
  },
  '&:focus': {
    outline: 0,
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
}

export const MenuItem: FC<MenuItemProps> = ({ children, icon, onSelect }) => {
  return (
    <Item css={menuItemStyles} onSelect={onSelect}>
      {icon != null && <span css={iconWrapperStyles}>{icon}</span>}
      <span css={childrenWrapperStyles}>{children}</span>
    </Item>
  );
};
