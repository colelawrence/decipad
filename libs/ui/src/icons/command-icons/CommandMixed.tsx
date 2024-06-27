import { CommandIcon } from './CommandIcon';
import { CommandMixedDark, CommandMixedLight } from './themed';

export const CommandMixed = () => (
  <CommandIcon light={<CommandMixedLight />} dark={<CommandMixedDark />} />
);
