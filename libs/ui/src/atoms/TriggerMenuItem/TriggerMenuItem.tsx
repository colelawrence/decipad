import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { TriggerItem } from '@radix-ui/react-dropdown-menu';
import { Caret } from '../../icons';
import { menuItemStyles } from '../MenuItem/MenuItem';

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
    <TriggerItem css={menuItemStyles}>
      {icon != null && <span css={iconWrapperStyles}>{icon}</span>}
      <span css={childrenWrapperStyles}>{children}</span>
      <span css={caretRightWrapper}>
        <Caret variant="right" />
      </span>
    </TriggerItem>
  );
};
