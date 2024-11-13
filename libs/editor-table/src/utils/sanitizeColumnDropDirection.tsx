import { ColumnDndDirection } from '@decipad/editor-types';

export const sanitizeColumnDropDirection = (dir: ColumnDndDirection) =>
  dir == null || dir === 'left' || dir === 'right' ? dir : undefined;
