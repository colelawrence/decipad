import { CommandIcon } from './CommandIcon';
import { CommandToggleLight, CommandToggleDark } from './themed';

export const CommandToggle = () => (
  <CommandIcon light={<CommandToggleLight />} dark={<CommandToggleDark />} />
);
