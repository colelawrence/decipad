import { CommandIcon } from './CommandIcon';
import { CommandBarLight, CommandBarDark } from './themed';

export const CommandBar = () => (
  <CommandIcon light={<CommandBarLight />} dark={<CommandBarDark />} />
);
