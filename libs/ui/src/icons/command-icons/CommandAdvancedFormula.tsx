import {
  CommandAdvancedFormulaDark,
  CommandAdvancedFormulaLight,
} from './themed';

import { CommandIcon } from './CommandIcon';

export const CommandAdvancedFormula = () => (
  <CommandIcon
    light={<CommandAdvancedFormulaLight />}
    dark={<CommandAdvancedFormulaDark />}
  />
);
