import { CommandIcon } from './CommandIcon';
import { CommandDateLight, CommandDateDark } from './themed';

export const CommandDate = () => (
  <CommandIcon light={<CommandDateLight />} dark={<CommandDateDark />} />
);
