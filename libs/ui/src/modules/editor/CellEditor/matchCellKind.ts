import { CellValueType } from '@decipad/editor-types';

export const matchCellKind = (kind?: string) => (cellType?: CellValueType) =>
  cellType
    ? cellType.kind === kind ||
      ('seriesType' in cellType && cellType.seriesType === kind)
    : false;
