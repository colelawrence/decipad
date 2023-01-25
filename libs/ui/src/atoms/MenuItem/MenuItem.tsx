import { css } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { ComponentProps, FC, ReactNode, useCallback } from 'react';
import { menu } from '../../styles';

const iconWrapperStyles = css({
  display: 'grid',
  alignItems: 'center',
  height: '16px',
  width: '16px',
});

const childrenWrapperStyles = css({
  flexGrow: 1,
});

export interface MenuItemProps {
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly disabled?: boolean;
  readonly onPointerMove?: ComponentProps<
    typeof RadixDropdownMenu.Item
  >['onPointerMove'];
  readonly onFocus?: ComponentProps<typeof RadixDropdownMenu.Item>['onFocus'];
  readonly onSelect?: () => void;
  readonly selected?: boolean;
  readonly itemAlignment?: 'left' | 'right' | 'center';
}

export const MenuItem: FC<MenuItemProps> = ({
  children,
  icon,
  onPointerMove,
  onFocus,
  onSelect,
  selected,
  disabled,
  itemAlignment,
}) => {
  const onSelectItem = useCallback(
    (event: Event) => {
      event.stopPropagation();
      if (onSelect) {
        onSelect();
      }
    },
    [onSelect]
  );
  return (
    <RadixDropdownMenu.Item
      css={disabled ? menu.itemDisabledStyles : menu.itemStyles}
      onSelect={onSelectItem}
      data-selected={selected}
      onPointerMove={onPointerMove}
      onFocus={onFocus}
      disabled={disabled}
    >
      {icon != null && <span css={iconWrapperStyles}>{icon}</span>}
      <span
        css={[
          childrenWrapperStyles,
          itemAlignment && {
            textAlign: itemAlignment,
          },
        ]}
      >
        {children}
      </span>
    </RadixDropdownMenu.Item>
  );
};
