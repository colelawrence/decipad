import { CommandIcon } from './CommandIcon';
import { CommandConnectSourceDark, CommandConnectSourceLight } from './themed';

export const CommandConnectSource = () => (
  <CommandIcon
    light={<CommandConnectSourceLight />}
    dark={<CommandConnectSourceDark />}
  />
);
