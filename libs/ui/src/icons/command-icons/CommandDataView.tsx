import { CommandIcon } from './CommandIcon';
import { CommandDataViewLight, CommandDataViewDark } from './themed';

export const CommandDataView = () => (
  <CommandIcon
    light={<CommandDataViewLight />}
    dark={<CommandDataViewDark />}
  />
);
