import type { CellPlugin } from '../types';
import { matchCellKind } from '../matchCellKind';
import { CellEditorDropdown } from '../CellEditorDropdown';

export const dropdownPlugin: CellPlugin = {
  query: matchCellKind('dropdown'),
  customCell: CellEditorDropdown,
};
