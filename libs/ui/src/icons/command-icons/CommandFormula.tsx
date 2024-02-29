import { CommandIcon } from './CommandIcon';
import { CommandFormulaLight, CommandFormulaDark } from './themed';

export const CommandFormula = () => (
  <CommandIcon light={<CommandFormulaLight />} dark={<CommandFormulaDark />} />
);
