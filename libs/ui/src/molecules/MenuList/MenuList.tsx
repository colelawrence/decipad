import { css } from '@emotion/react';
import { ReactNode, Children, FC, createContext, useContext } from 'react';
import { isElement } from 'react-is';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

import { MenuItem, TriggerMenuItem } from '../../atoms';
import { UnitMenuItem } from '..';
import { cssVar, grey300, transparency } from '../../primitives';

const Depth = createContext(0);

const shadow1 = transparency(grey300, 0.02).rgba;
const shadow2 = transparency(grey300, 0.08).rgba;

const styles = css({
  padding: '6px',

  backgroundColor: cssVar('backgroundColor'),
  boxShadow: `0px 1px 2px ${shadow1}, 0px 2px 12px ${shadow2}`,
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
});

const undropdownifyContentStyles = css({
  '>[data-radix-popper-content-wrapper]': { display: 'contents' },
});

interface RootMenuListProps {
  readonly root: true;
  readonly trigger?: undefined;
  readonly dropdown?: false;

  readonly itemTrigger?: undefined;
}

interface DropdownRootMenuListProps {
  readonly root: true;
  readonly trigger: ReactNode;
  readonly dropdown: true;

  readonly itemTrigger?: undefined;
}

interface MenuItemMenuListProps {
  readonly root?: undefined;
  readonly trigger?: undefined;
  readonly dropdown?: undefined;

  readonly itemTrigger: ReactNode;
}

type MenuListProps = (
  | RootMenuListProps
  | DropdownRootMenuListProps
  | MenuItemMenuListProps
) & {
  readonly children: ReactNode;
  readonly open?: boolean;
  readonly onChangeOpen?: (newOpen: boolean) => void;
};

export const MenuList = ({
  children,

  root,

  trigger = <div css={{ display: 'none' }} />,
  itemTrigger,

  open,
  onChangeOpen,

  dropdown = !root,
}: MenuListProps): ReturnType<FC> => {
  const depth = useContext(Depth) + 1;

  if (root && depth > 1) {
    throw new Error('Cannot use root MenuList nested in another MenuList');
  }
  if (!root && depth === 1) {
    throw new Error('Non-root MenuList must be nested in another MenuList');
  }

  let triggerNode: ReactNode;
  if (root) {
    triggerNode = (
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>
    );
  } else if (isElement(itemTrigger) && itemTrigger.type === TriggerMenuItem) {
    triggerNode = itemTrigger;
  } else {
    throw new Error('itemTrigger must be a TriggerMenuItem element');
  }

  return (
    <Depth.Provider value={depth}>
      <RadixDropdownMenu.Root
        open={open}
        onOpenChange={onChangeOpen}
        modal={dropdown}
      >
        {triggerNode}
        <div css={dropdown || undropdownifyContentStyles}>
          <RadixDropdownMenu.Content css={styles} portalled={dropdown}>
            {Children.map(children, (child) => {
              if (child == null) {
                return null;
              }
              if (
                isElement(child) &&
                (child.type === MenuItem ||
                  child.type === MenuList ||
                  child.type === UnitMenuItem)
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
          </RadixDropdownMenu.Content>
        </div>
      </RadixDropdownMenu.Root>
    </Depth.Provider>
  );
};
