import { getTarget } from '../utils/path';

export function removeText(
  doc: SyncValue,
  op: ExtendedSlate.ExtendedSlateRemoveTextOperation
): SyncValue {
  const node = getTarget(doc, op.path);
  const offset = Math.min(node.text.length, op.offset);
  node.text.deleteAt(offset, op.text.length);

  return doc;
}
