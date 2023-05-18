import { TOperation } from '@udecode/plate';

const EMPTY: Array<number> = [];

export const affectedBlocks = (op: TOperation): number[] => {
  if (op.type === 'set_selection') {
    return EMPTY;
  }
  if (op.type === 'move_node') {
    return [op.path[0], op.newPath[0]];
  }
  return [op.path[0]];
};
