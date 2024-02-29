import { CommandIcon } from './CommandIcon';
import { CommandTableLight, CommandTableDark } from './themed';

export const CommandTable = () => (
  <CommandIcon light={<CommandTableLight />} dark={<CommandTableDark />} />
);
