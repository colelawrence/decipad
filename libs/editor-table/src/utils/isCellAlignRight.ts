import type { TableCellType } from '@decipad/editor-types';
import type { SerializedType } from '@decipad/remote-computer';

export const isCellAlignRight = (cellType?: TableCellType | SerializedType) =>
  cellType?.kind && ['number', 'boolean', 'date'].includes(cellType.kind);
