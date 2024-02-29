import { CommandIcon } from './CommandIcon';
import { CommandDataMappingLight, CommandDataMappingDark } from './themed';

export const CommandDataMapping = () => (
  <CommandIcon
    light={<CommandDataMappingLight />}
    dark={<CommandDataMappingDark />}
  />
);
