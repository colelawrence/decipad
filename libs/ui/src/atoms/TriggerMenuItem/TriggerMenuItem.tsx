import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { Caret } from '../../icons';
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
}

export const TriggerMenuItem: FC<TriggerMenuItemProps> = ({
  children,
  icon,
}) => {
  return (
    <RadixDropdownMenu.TriggerItem css={menu.itemStyles}>
      {icon != null && <span css={iconWrapperStyles}>{icon}</span>}
      <span css={childrenWrapperStyles}>{children}</span>
      <span css={caretRightWrapper}>
        <Caret variant="right" />
      </span>
    </RadixDropdownMenu.TriggerItem>
  );
};
