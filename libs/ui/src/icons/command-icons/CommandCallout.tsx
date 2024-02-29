import { CommandIcon } from './CommandIcon';
import { CommandCalloutLight, CommandCalloutDark } from './themed';

export const CommandCallout = () => (
  <CommandIcon light={<CommandCalloutLight />} dark={<CommandCalloutDark />} />
);
