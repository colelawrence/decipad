import type { ColumnDndDirection } from '../types';

export const sanitizeColumnDropDirection = (dir: ColumnDndDirection) =>
  dir == null || dir === 'left' || dir === 'right' ? dir : undefined;
