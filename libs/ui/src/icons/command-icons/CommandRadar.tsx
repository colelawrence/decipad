import { CommandIcon } from './CommandIcon';
import { CommandRadarDark, CommandRadarLight } from './themed';

export const CommandRadar = () => (
  <CommandIcon light={<CommandRadarLight />} dark={<CommandRadarDark />} />
);
