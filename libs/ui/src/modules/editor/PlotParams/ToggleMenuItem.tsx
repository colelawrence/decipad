import { MenuItem, Toggle } from 'libs/ui/src/shared';
import { ReactNode } from 'react';
import { constMenuMinWidth, menuItemWithIconOnEnd } from './styles';

type ToggleMenuItemProps = {
  menuKey: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  onChange: (newActive: boolean) => void;
};

export const ToggleMenuItem = ({
  menuKey,
  icon,
  label,
  active,
  onChange,
}: ToggleMenuItemProps) => (
  <MenuItem
    key={menuKey}
    icon={icon}
    onSelect={(e) => e.preventDefault()}
    data-testid={`chart__settings__${menuKey}`}
  >
    <div css={menuItemWithIconOnEnd}>
      <div css={constMenuMinWidth}>{label}</div>
      <div>
        <Toggle variant="small-switch" active={active} onChange={onChange} />
      </div>
    </div>
  </MenuItem>
);
