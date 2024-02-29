import { CommandIcon } from './CommandIcon';
import { CommandDividerLight, CommandDividerDark } from './themed';

export const CommandDivider = () => (
  <CommandIcon light={<CommandDividerLight />} dark={<CommandDividerDark />} />
);
