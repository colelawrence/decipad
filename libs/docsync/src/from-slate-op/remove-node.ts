import { getParent, getChildren } from '../utils/path';
import { ExtendedSlateRemoveNodeOperation, SyncValue } from '../types';

export function removeNode(
  doc: SyncValue,
  op: ExtendedSlateRemoveNodeOperation
): SyncValue {
  const [parent, index] = getParent(doc, op.path);

  getChildren(parent).splice(index, 1);

  return doc;
}
