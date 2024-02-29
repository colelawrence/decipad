import { CommandIcon } from './CommandIcon';
import { CommandResultDark, CommandResultLight } from './themed';

export const CommandResult = () => (
  <CommandIcon light={<CommandResultLight />} dark={<CommandResultDark />} />
);
