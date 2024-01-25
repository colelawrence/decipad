import type { CellPlugin } from '../types';
import { matchCellKind } from '../matchCellKind';
import { CellEditorCategory } from '../CellEditorCategory';

export const categoryPlugin: CellPlugin = {
  query: matchCellKind('category'),
  customCell: CellEditorCategory,
};
