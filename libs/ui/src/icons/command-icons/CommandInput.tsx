import { CommandIcon } from './CommandIcon';
import { CommandInputDark, CommandInputLight } from './themed';

export const CommandInput = () => (
  <CommandIcon light={<CommandInputLight />} dark={<CommandInputDark />} />
);
