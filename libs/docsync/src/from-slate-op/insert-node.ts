import { getParent, getChildren } from '../utils/path';
import { toSync } from '../utils/to-sync';
import { ExtendedSlateInsertNodeOperation, SyncValue } from '../types';

export function insertNode(
  doc: SyncValue,
  op: ExtendedSlateInsertNodeOperation
): SyncValue {
  const [parent, index] = getParent(doc, op.path);

  getChildren(parent).splice(index, 0, toSync(op.node));

  return doc;
}
