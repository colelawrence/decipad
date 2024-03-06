import type { CellPlugin } from '../types';
import { numberPlugin } from './numberPlugin';
import { formulaPlugin } from './formulaPlugin';
import { booleanPlugin } from './booleanPlugin';
import { datePlugin } from './datePlugin';
import { seriesPlugin } from './seriesPlugin';
import { unitPlugin } from './unitPlugin';
import { parseErrorPlugin } from './parseErrorPlugin';
import { dropdownPlugin } from './dropdownPlugin';
import { categoryPlugin } from './categoryPlugin';
import { computedValuePlugin } from './computedValuePlugin';

export const cellPlugins: CellPlugin[] = [
  numberPlugin,
  formulaPlugin,
  booleanPlugin,
  datePlugin,
  seriesPlugin,
  dropdownPlugin,
  unitPlugin,
  parseErrorPlugin,
  categoryPlugin,
  computedValuePlugin,
];
