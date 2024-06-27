import { CommandIcon } from './CommandIcon';
import { CommandFunnelDark, CommandFunnelLight } from './themed';

export const CommandFunnel = () => (
  <CommandIcon light={<CommandFunnelLight />} dark={<CommandFunnelDark />} />
);
