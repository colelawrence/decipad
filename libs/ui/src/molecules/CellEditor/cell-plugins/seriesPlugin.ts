import type { CellPlugin } from '../types';
import { matchCellKind } from '../matchCellKind';

export const seriesPlugin: CellPlugin = {
  query: matchCellKind('series'),
  useEditable: (editable, { path }) => {
    if (!editable) return false;
    const rowIndex = path[path.length - 2];
    return rowIndex === 2;
  },
};
