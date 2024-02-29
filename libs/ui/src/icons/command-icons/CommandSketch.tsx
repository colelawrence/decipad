import { CommandIcon } from './CommandIcon';
import { CommandSketchDark, CommandSketchLight } from './themed';

export const CommandSketch = () => (
  <CommandIcon light={<CommandSketchLight />} dark={<CommandSketchDark />} />
);
