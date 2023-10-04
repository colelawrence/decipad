import type { TOperation } from '@udecode/plate';
import type { Path } from 'slate';

const EMPTY: Array<Path> = [];

const expandPath = (path: Path): Array<Path> =>
  path.map((_, pos) => path.slice(0, pos + 1)).filter((p) => p.length > 0);

const expandPaths = (paths: Array<Path>): Array<Path> =>
  paths.flatMap(expandPath);

export const affectedPaths = (op: TOperation): Array<Path> => {
  if (op.type === 'set_selection') {
    return EMPTY;
  }
  if (op.type === 'move_node') {
    return expandPaths([op.path, op.newPath]);
  }
  return expandPaths([op.path]);
};
