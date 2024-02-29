import { CommandIcon } from './CommandIcon';
import { CommandPlotLight, CommandPlotDark } from './themed';

export const CommandPlot = () => (
  <CommandIcon light={<CommandPlotLight />} dark={<CommandPlotDark />} />
);
