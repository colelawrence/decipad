import { CommandIcon } from './CommandIcon';
import { CommandPieLight, CommandPieDark } from './themed';

export const CommandPie = () => (
  <CommandIcon light={<CommandPieLight />} dark={<CommandPieDark />} />
);
