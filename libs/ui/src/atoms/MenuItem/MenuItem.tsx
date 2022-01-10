import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { menu } from '../../styles';

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
    <RadixDropdownMenu.Item
      css={menu.itemStyles}
      onSelect={onSelect}
      data-selected={selected}
    >
      {icon != null && <span css={iconWrapperStyles}>{icon}</span>}
      <span css={childrenWrapperStyles}>{children}</span>
    </RadixDropdownMenu.Item>
  );
};
