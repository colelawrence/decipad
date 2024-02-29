import { CommandIcon } from './CommandIcon';
import { CommandAreaDark, CommandAreaLight } from './themed';

export const CommandArea = () => (
  <CommandIcon light={<CommandAreaLight />} dark={<CommandAreaDark />} />
);
