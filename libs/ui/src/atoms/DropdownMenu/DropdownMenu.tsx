/* eslint decipad/css-prop-named-variable: 0 */
import { SerializedStyles } from '@emotion/react';
import { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import { MenuList } from '../../molecules';
import { MenuItem } from '../MenuItem/MenuItem';

interface DropdownItem {
  readonly label: string;
  readonly icon?: ReactNode;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
}

interface DropdownMenuProps {
  readonly trigger: ReactElement<any, any>;
  readonly items: DropdownItem[];
  readonly testId?: string;
  readonly styles?: SerializedStyles;
  readonly className?: string;
  readonly open: boolean;
  readonly onChangeOpen: Dispatch<SetStateAction<boolean>>;
}

const DropdownMenu = ({
  trigger,
  items,
  testId,
  styles,
  className,
  open,
  onChangeOpen,
}: DropdownMenuProps) => {
  return (
    <div
      data-testid={testId}
      className={className}
      css={styles}
      contentEditable={false}
    >
      <MenuList
        root
        dropdown
        open={open}
        onChangeOpen={onChangeOpen}
        trigger={trigger}
      >
        {items.map((item, i) => (
          <MenuItem
            key={`column-menu-left-${i}`}
            icon={item.icon}
            onSelect={item.onClick}
          >
            {item.label}
          </MenuItem>
        ))}
      </MenuList>
    </div>
  );
};

export default DropdownMenu;
