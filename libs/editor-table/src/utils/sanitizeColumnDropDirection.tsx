import { DropDirection } from '@decipad/editor-components';

export const sanitizeColumnDropDirection = (dir: DropDirection) =>
  dir == null || dir === 'left' || dir === 'right' ? dir : undefined;
