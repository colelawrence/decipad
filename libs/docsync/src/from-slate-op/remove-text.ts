import { getTarget } from '../utils/path';
import { ExtendedSlateRemoveTextOperation, SyncValue } from '../types';

export function removeText(
  doc: SyncValue,
  op: ExtendedSlateRemoveTextOperation
): SyncValue {
  const node = getTarget(doc, op.path);
  const offset = Math.min(node.text.length, op.offset);
  node.text.deleteAt(offset, op.text.length);

  return doc;
}
