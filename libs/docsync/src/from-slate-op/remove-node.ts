import { getParent, getChildren } from '../utils/path';

export function removeNode(
  doc: SyncValue,
  op: ExtendedSlate.ExtendedSlateRemoveNodeOperation
): SyncValue {
  const [parent, index] = getParent(doc, op.path);

  getChildren(parent).splice(index, 1);

  return doc;
}
