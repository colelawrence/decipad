import { RemoveNodeOperation } from 'slate';
import { getParent, getChildren } from '../utils/path';

function removeNode(doc: SyncPadValue, op: RemoveNodeOperation): SyncPadValue {
  const [parent, index] = getParent(doc, op.path);

  getChildren(parent).splice(index, 1);

  return doc;
}

export { removeNode };
