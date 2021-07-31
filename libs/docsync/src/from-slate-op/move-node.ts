import { cloneNode } from '../utils/clone-node';
import { getParent, getChildren } from '../utils/path';
import { ExtendedSlateMoveNodeOperation, SyncValue } from '../types';

export function moveNode(
  doc: SyncValue,
  op: ExtendedSlateMoveNodeOperation
): SyncValue {
  const [from, fromIndex] = getParent(doc, op.path);
  const [to, toIndex] = getParent(doc, op.newPath);

  getChildren(to).splice(
    toIndex,
    0,
    ...getChildren(from).splice(fromIndex, 1).map(cloneNode)
  );

  return doc;
}
