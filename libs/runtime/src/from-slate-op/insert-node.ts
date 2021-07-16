import { getParent, getChildren } from '../utils/path';
import { toSync } from '../utils/to-sync';

export function insertNode(
  doc: SyncPadValue,
  op: ExtendedSlate.ExtendedSlateInsertNodeOperation
): SyncPadValue {
  const [parent, index] = getParent(doc, op.path);

  getChildren(parent).splice(index, 0, toSync(op.node));

  return doc;
}
