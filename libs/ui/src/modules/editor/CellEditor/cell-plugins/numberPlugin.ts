import type { CellPlugin } from '../types';
import { matchCellKind } from '../matchCellKind';

export const numberPlugin: CellPlugin = {
  query: matchCellKind('number'),
  useTextAlign: () => 'right',
};
