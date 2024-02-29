import { CommandIcon } from './CommandIcon';
import { CommandSubmitLight, CommandSubmitDark } from './themed';

export const CommandSubmit = () => (
  <CommandIcon light={<CommandSubmitLight />} dark={<CommandSubmitDark />} />
);
