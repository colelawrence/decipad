import { css } from '@emotion/react';
import { ReactNode, Children, FC } from 'react';
import { isElement } from 'react-is';
import {
  Content as MenuContent,
  Root as MenuRoot,
  Trigger as MenuTrigger,
  DropdownMenuProps,
} from '@radix-ui/react-dropdown-menu';

import { MenuItem, TriggerMenuItem } from '../../atoms';
import { cssVar, grey300, transparency } from '../../primitives';

const shadow1 = transparency(grey300, 0.02).rgba;
const shadow2 = transparency(grey300, 0.08).rgba;
const styles = css({
  minWidth: '180px',
  width: '100%',

  padding: '6px',

  backgroundColor: cssVar('backgroundColor'),
  boxShadow: `0px 1px 2px ${shadow1}, 0px 2px 12px ${shadow2}`,
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
});

interface MenuListProps
  extends Pick<DropdownMenuProps, 'defaultOpen' | 'onOpenChange'> {
  readonly children?: ReactNode;
  readonly trigger: ReactNode;
}

export const MenuList = ({
  children,
  defaultOpen,
  onOpenChange,
  trigger,
}: MenuListProps): ReturnType<FC> => {
  return (
    <MenuRoot defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {isElement(trigger) && trigger.type === TriggerMenuItem ? (
        trigger
      ) : (
        <MenuTrigger asChild>{trigger}</MenuTrigger>
      )}
      <MenuContent css={styles}>
        {Children.map(children, (child) => {
          if (child == null) {
            return null;
          }
          if (
            isElement(child) &&
            (child.type === MenuItem || child.type === MenuList)
          ) {
            return child;
          }
          console.error(
            'Received child that is not a menu list or menu item',
            child
          );
          throw new Error(
            'Expected all children to be menu lists or menu items'
          );
        })}
      </MenuContent>
    </MenuRoot>
  );
};
