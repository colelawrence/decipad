import { CommandIcon } from './CommandIcon';
import { CommandDropdownLight, CommandDropdownDark } from './themed';

export const CommandDropdown = () => (
  <CommandIcon
    light={<CommandDropdownLight />}
    dark={<CommandDropdownDark />}
  />
);
