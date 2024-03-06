import type { CellPlugin } from '../types';
import { matchCellKind } from '../matchCellKind';
import { CellEditorFormula } from '../CellEditorFormula';

export const formulaPlugin: CellPlugin = {
  query: matchCellKind('table-formula'),
  customCell: CellEditorFormula,
};
