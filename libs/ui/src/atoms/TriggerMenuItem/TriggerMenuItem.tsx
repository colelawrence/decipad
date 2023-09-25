/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { FC, ReactNode, useContext } from 'react';
import { Caret } from '../../icons';
import { Depth } from '../../molecules/MenuList/MenuList';
import { grey400, p12Medium } from '../../primitives';
import { menu } from '../../styles';

const iconWrapperStyles = css({
  height: '16px',
  width: '16px',
});

const childrenWrapperStyles = css({
  flexGrow: 1,
});

const caretRightWrapper = css({
  height: '16px',
  width: '16px',
});

const selectedPreviewStyles = css({
  p12Medium,
  ...{
    color: grey400.rgb,
  },
});

interface TriggerMenuItemProps {
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly selected?: boolean;
  readonly selectedPreview?: string;
  readonly disabled?: boolean;
}

export const TriggerMenuItem: FC<TriggerMenuItemProps> = ({
  children,
  icon,
  selected,
  selectedPreview,
  disabled,
}) => {
  const depth = useContext(Depth);
  const DropdownMenuTriggerElement =
    depth === 0 ? RadixDropdownMenu.Trigger : RadixDropdownMenu.SubTrigger;

  return (
    <DropdownMenuTriggerElement
      disabled={disabled}
      css={disabled ? menu.itemDisabledStyles : menu.itemStyles}
      data-selected={selected}
    >
      {icon != null && <span css={iconWrapperStyles}>{icon}</span>}
      <span css={childrenWrapperStyles} data-testid="trigger-menu-item">
        {children}
      </span>
      {selectedPreview && (
        <span css={selectedPreviewStyles}>{selectedPreview}</span>
      )}
      <span css={caretRightWrapper}>
        <Caret variant="right" />
      </span>
    </DropdownMenuTriggerElement>
  );
};
