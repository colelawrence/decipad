import { TableCellType } from '@decipad/editor-types';
import { SerializedType } from '@decipad/computer';

export const isCellAlignRight = (cellType?: TableCellType | SerializedType) =>
  cellType?.kind && ['number', 'boolean', 'date'].includes(cellType.kind);
