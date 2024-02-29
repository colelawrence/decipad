import { CommandIcon } from './CommandIcon';
import { CommandNotionLight, CommandNotionDark } from './themed';

export const CommandNotion = () => (
  <CommandIcon light={<CommandNotionLight />} dark={<CommandNotionDark />} />
);
