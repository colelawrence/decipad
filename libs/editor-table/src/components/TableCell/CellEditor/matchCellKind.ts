import type { CellValueType } from '@decipad/editor-types';

export const matchCellKind = (kind?: string) => (cellType?: CellValueType) => {
  return cellType
    ? cellType.kind === kind ||
        ('seriesType' in cellType && cellType.seriesType === kind)
    : false;
};
