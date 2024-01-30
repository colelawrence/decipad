import type { CellPlugin } from '../types';
import { matchCellKind } from '../matchCellKind';
import { CellEditorBoolean } from '../CellEditorBoolean';

export const booleanPlugin: CellPlugin = {
  query: matchCellKind('boolean'),
  customCell: CellEditorBoolean,
};
