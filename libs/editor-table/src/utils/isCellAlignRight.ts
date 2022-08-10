import { TableCellType } from '@decipad/editor-types';

export const isCellAlignRight = (cellType?: TableCellType) =>
  cellType?.kind && ['number', 'boolean', 'date'].includes(cellType.kind);
