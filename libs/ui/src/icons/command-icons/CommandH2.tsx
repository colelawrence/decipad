import { CommandIcon } from './CommandIcon';
import { CommandH2Dark, CommandH2Light } from './themed';

export const CommandH2 = () => (
  <CommandIcon light={<CommandH2Light />} dark={<CommandH2Dark />} />
);
