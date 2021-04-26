import { SetNodeOperation } from 'slate';
import { getTarget } from '../utils/path';

function setNode(doc: SyncPadValue, op: SetNodeOperation): SyncPadValue {
  const node = getTarget(doc, op.path);

  const { newProperties } = op;

  for (const key in newProperties) {
    const value = newProperties[key];
    if (value !== undefined) {
      node[key] = value;
    } else {
      delete node[key];
    }
  }

  return doc;
}

export { setNode };
