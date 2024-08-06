import { CommandIcon } from './CommandIcon';
import { CommandLayoutDark, CommandLayoutLight } from './themed';

export const CommandLayout = () => (
  <CommandIcon light={<CommandLayoutLight />} dark={<CommandLayoutDark />} />
);
