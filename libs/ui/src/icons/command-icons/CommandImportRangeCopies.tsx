import { CommandIcon } from './CommandIcon';
import {
  CommandImportRangeCopiesDark,
  CommandImportRangeCopiesLight,
} from './themed';

export const CommandImportRangeCopies = () => (
  <CommandIcon
    light={<CommandImportRangeCopiesLight />}
    dark={<CommandImportRangeCopiesDark />}
  />
);
