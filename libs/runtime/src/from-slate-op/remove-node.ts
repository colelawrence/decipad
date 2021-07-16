import { getParent, getChildren } from '../utils/path';

export function removeNode(
  doc: SyncPadValue,
  op: ExtendedSlate.ExtendedSlateRemoveNodeOperation
): SyncPadValue {
  const [parent, index] = getParent(doc, op.path);

  getChildren(parent).splice(index, 1);

  return doc;
}
