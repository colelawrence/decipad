import { RemoveNodeOperation } from 'slate';
import { getParent, getChildren } from '../utils/path';

function removeNode(doc: SyncPadValue, op: RemoveNodeOperation): SyncPadValue {
  const [parent, index] = getParent(doc, op.path);

  if (parent.text) {
    throw new TypeError("Can't remove node from text node");
  }

  getChildren(parent).splice(index, 1);

  return doc;
}

export { removeNode };
