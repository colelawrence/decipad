import { CommandIcon } from './CommandIcon';
import { CommandImageDark, CommandImageLight } from './themed';

export const CommandImage = () => (
  <CommandIcon light={<CommandImageLight />} dark={<CommandImageDark />} />
);
