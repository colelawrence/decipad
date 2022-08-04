import { css } from '@emotion/react';
import { ReactNode, Children, FC, createContext, useContext } from 'react';
import { isElement } from 'react-is';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

import { MenuItem, MenuSeparator, TriggerMenuItem } from '../../atoms';
import { InputMenuItem, UnitMenuItem } from '..';
import { cssVar, grey500, transparency } from '../../primitives';

export const Depth = createContext(0);

const shadow1 = transparency(grey500, 0.02).rgba;
const shadow2 = transparency(grey500, 0.08).rgba;

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

function getSubElementType(isRoot: boolean | undefined) {
  const DropdownMenuTopElement = isRoot
    ? RadixDropdownMenu.Root
    : RadixDropdownMenu.Sub;

  const DropdownMenuContentElement = isRoot
    ? RadixDropdownMenu.Content
    : RadixDropdownMenu.SubContent;

  const DropdownMenuTriggerElement = isRoot
    ? RadixDropdownMenu.Trigger
    : RadixDropdownMenu.SubTrigger;
  return {
    DropdownMenuTriggerElement,
    DropdownMenuTopElement,
    DropdownMenuContentElement,
  };
}

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

  const {
    DropdownMenuTriggerElement,
    DropdownMenuTopElement,
    DropdownMenuContentElement,
  } = getSubElementType(root);

  let triggerNode: ReactNode;
  if (root) {
    triggerNode = (
      <DropdownMenuTriggerElement asChild>{trigger}</DropdownMenuTriggerElement>
    );
  } else if (isElement(itemTrigger) && itemTrigger.type === TriggerMenuItem) {
    triggerNode = itemTrigger;
  } else {
    throw new Error('itemTrigger must be a TriggerMenuItem element');
  }

  return (
    <Depth.Provider value={depth}>
      <DropdownMenuTopElement
        open={open}
        onOpenChange={onChangeOpen}
        modal={dropdown}
      >
        {triggerNode}
        <RadixDropdownMenu.Portal>
          <div css={dropdown || undropdownifyContentStyles}>
            <DropdownMenuContentElement
              css={styles}
              align="start"
              onFocusOutside={(e) => e.preventDefault()}
            >
              {Children.map(children, (child) => {
                if (child == null) {
                  return null;
                }
                if (
                  isElement(child) &&
                  (child.type === MenuItem ||
                    child.type === MenuList ||
                    child.type === MenuSeparator ||
                    child.type === InputMenuItem ||
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
            </DropdownMenuContentElement>
          </div>
        </RadixDropdownMenu.Portal>
      </DropdownMenuTopElement>
    </Depth.Provider>
  );
};
