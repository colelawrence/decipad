import { CommandIcon } from './CommandIcon';
import { CommandH1Dark, CommandH1Light } from './themed';

export const CommandH1 = () => (
  <CommandIcon light={<CommandH1Light />} dark={<CommandH1Dark />} />
);
