import { CommandIcon } from './CommandIcon';
import { CommandImportCopyDark, CommandImportCopyLight } from './themed';

export const CommandImportCopy = () => (
  <CommandIcon
    light={<CommandImportCopyLight />}
    dark={<CommandImportCopyDark />}
  />
);
