import { css } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { FC, ReactNode, useContext } from 'react';
import { Caret } from '../../icons';
import { Depth } from '../../molecules/MenuList/MenuList';
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

interface TriggerMenuItemProps {
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly selected?: boolean;
}

export const TriggerMenuItem: FC<TriggerMenuItemProps> = ({
  children,
  icon,
  selected,
}) => {
  const depth = useContext(Depth);
  const DropdownMenuTriggerElement =
    depth === 0 ? RadixDropdownMenu.Trigger : RadixDropdownMenu.SubTrigger;

  return (
    <DropdownMenuTriggerElement css={menu.itemStyles} data-selected={selected}>
      {icon != null && <span css={iconWrapperStyles}>{icon}</span>}
      <span css={childrenWrapperStyles}>{children}</span>
      <span css={caretRightWrapper}>
        <Caret variant="right" />
      </span>
    </DropdownMenuTriggerElement>
  );
};
