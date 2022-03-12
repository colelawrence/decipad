import { ReactNode } from 'react';
import { noop } from '@decipad/utils';
import { Code } from '../../icons';
import { MenuItem, MenuSeparator } from '../../atoms';
import { MenuList } from '../../molecules';

interface InteractiveInputMenuProps {
  readonly onConvert?: () => void;
  readonly onCopy?: () => void;
  readonly onDelete?: () => void;
  readonly trigger: ReactNode;
}

export const InteractiveInputMenu: React.FC<InteractiveInputMenuProps> = ({
  onConvert = noop,
  onCopy = noop,
  onDelete = noop,
  trigger,
}) => (
  <MenuList root dropdown trigger={trigger}>
    <MenuItem icon={<Code />} onSelect={onConvert}>
      <div css={{ minWidth: '165px' }}>Turn into code</div>
    </MenuItem>
    <MenuSeparator />
    <MenuItem onSelect={onCopy}>Copy</MenuItem>
    <MenuItem onSelect={onDelete}>Delete</MenuItem>
  </MenuList>
);
