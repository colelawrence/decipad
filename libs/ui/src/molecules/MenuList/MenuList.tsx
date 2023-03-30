import { css, SerializedStyles } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { createContext, FC, ReactElement, ReactNode, useContext } from 'react';
import { isElement } from 'react-is';

import { TriggerMenuItem } from '../../atoms';
import { cssVar, grey500, transparency } from '../../primitives';

export const Depth = createContext(0);

const shadow1 = transparency(grey500, 0.02).rgba;
const shadow2 = transparency(grey500, 0.08).rgba;

const defaultStyles = css({
  display: 'flex',
  flexDirection: 'column',

  gap: '2px',
  padding: '6px',
  backgroundColor: cssVar('backgroundColor'),
  boxShadow: `0px 1px 2px ${shadow1}, 0px 2px 12px ${shadow2}`,
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '8px',
});

const undropdownifyContentStyles = css({
  '>[data-radix-popper-content-wrapper]': { display: 'contents' },
});

const alwaysTopContentStyles = css({
  zIndex: 3,
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
  readonly portal?: boolean;
  readonly onChangeOpen?: (newOpen: boolean) => void;
  readonly align?: 'center' | 'end' | 'start';
  readonly side?: 'top' | 'right' | 'bottom' | 'left';
  readonly sideOffset?: number;
  readonly container?: HTMLElement;
  readonly styles?: SerializedStyles;
  readonly dataTestid?: string;
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

type MenuListPortalComponentProps = {
  portal: boolean;
  children: ReactNode;
  container?: HTMLElement;
};

const DropdownMenuPortalElement = ({
  portal,
  container,
  children,
}: MenuListPortalComponentProps): ReactElement<MenuListPortalComponentProps> => {
  if (portal) {
    return (
      <RadixDropdownMenu.Portal container={container}>
        {children}
      </RadixDropdownMenu.Portal>
    );
  }
  return <>{children}</>;
};

export const MenuList: FC<MenuListProps> = ({
  children,

  root,

  trigger = <div css={{ display: 'none' }} />,
  itemTrigger,

  open,
  onChangeOpen,

  dropdown = !root,
  portal = true,
  align = 'start',
  side = 'bottom',
  sideOffset = 0,
  container,
  styles = css({}),
  dataTestid,
}) => {
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
        <DropdownMenuPortalElement portal={portal} container={container}>
          <div
            css={[
              dropdown || undropdownifyContentStyles,
              alwaysTopContentStyles,
            ]}
          >
            <DropdownMenuContentElement
              css={css([defaultStyles, styles])}
              align={align}
              onFocusOutside={(e) => e.preventDefault()}
              onClick={(e) => e.preventDefault()}
              side={side}
              sideOffset={sideOffset}
              data-testid={dataTestid}
            >
              {children}
            </DropdownMenuContentElement>
          </div>
        </DropdownMenuPortalElement>
      </DropdownMenuTopElement>
    </Depth.Provider>
  );
};
