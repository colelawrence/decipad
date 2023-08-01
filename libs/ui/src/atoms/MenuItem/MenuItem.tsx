/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { Badge } from '@decipad/ui';
import { ComponentProps, FC, ReactNode, useCallback } from 'react';
import { menu } from '../../styles';
import { componentCssVars } from '../../primitives';

const iconWrapperStyles = css({
  display: 'grid',
  alignItems: 'center',
  height: '16px',
  width: '16px',
});

const childrenWrapperStyles = css({
  flexGrow: 1,
});

const newBadgeStyles = css({
  background: componentCssVars('AiBubbleBackgroundColor'),
  color: componentCssVars('AiTextColor'),
  marginLeft: 8,
});

const newCss = css({
  color: componentCssVars('AiTextColor'),
  svg: {
    fill: componentCssVars('AiTextColor'),
  },
});

export type MenuItemProps = {
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
  readonly testid?: string;
  readonly isNew?: boolean;
} & ComponentProps<typeof RadixDropdownMenu.Item>;

export const MenuItem: FC<MenuItemProps> = ({
  children,
  icon,
  onPointerMove,
  onFocus,
  onSelect,
  selected,
  disabled,
  itemAlignment,
  testid = '',
  isNew,
  ...rest
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
      css={[
        disabled ? menu.itemDisabledStyles : menu.itemStyles,
        isNew && newCss,
      ]}
      onSelect={onSelectItem}
      data-selected={selected}
      onPointerMove={onPointerMove}
      onFocus={onFocus}
      disabled={disabled}
      data-testid={testid}
      {...rest}
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
        {isNew && <Badge styles={newBadgeStyles}>New</Badge>}
      </span>
    </RadixDropdownMenu.Item>
  );
};
