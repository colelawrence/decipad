import { CommandIcon } from './CommandIcon';
import { CommandConnectRangesDark, CommandConnectRangesLight } from './themed';

export const CommandConnectRanges = () => (
  <CommandIcon
    light={<CommandConnectRangesLight />}
    dark={<CommandConnectRangesDark />}
  />
);
