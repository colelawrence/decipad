import { CommandIcon } from './CommandIcon';
import { CommandCsvLight, CommandCsvDark } from './themed';

export const CommandCsv = () => (
  <CommandIcon light={<CommandCsvLight />} dark={<CommandCsvDark />} />
);
