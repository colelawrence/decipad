import { getTarget } from '../utils/path';
import { ExtendedSlateSetNodeOperation, SyncValue } from '../types';

export function setNode(
  doc: SyncValue,
  op: ExtendedSlateSetNodeOperation
): SyncValue {
  const node = getTarget(doc, op.path);

  const { newProperties } = op;

  for (const [key, value] of Object.entries(newProperties)) {
    if (value !== undefined) {
      node[key] = value;
    } else {
      delete node[key];
    }
  }

  return doc;
}
