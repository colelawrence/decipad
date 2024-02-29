import { CommandIcon } from './CommandIcon';
import { CommandSliderDark, CommandSliderLight } from './themed';

export const CommandSlider = () => (
  <CommandIcon light={<CommandSliderLight />} dark={<CommandSliderDark />} />
);
