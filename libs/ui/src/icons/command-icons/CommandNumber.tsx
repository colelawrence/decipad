import { CommandIcon } from './CommandIcon';
import { CommandNumberDark, CommandNumberLight } from './themed';

export const CommandNumber = () => (
  <CommandIcon light={<CommandNumberLight />} dark={<CommandNumberDark />} />
);
