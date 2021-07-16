import { getTarget } from '../utils/path';

export function setNode(
  doc: SyncPadValue,
  op: ExtendedSlate.ExtendedSlateSetNodeOperation
): SyncPadValue {
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
