import { CommandIcon } from './CommandIcon';
import { CommandLineLight, CommandLineDark } from './themed';

export const CommandLine = () => (
  <CommandIcon light={<CommandLineLight />} dark={<CommandLineDark />} />
);
