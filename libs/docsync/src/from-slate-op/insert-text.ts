import { getTarget } from '../utils/path';

export function insertText(
  doc: SyncValue,
  op: ExtendedSlate.ExtendedSlateInsertTextOperation
): SyncValue {
  const node = getTarget(doc, op.path);

  const offset = Math.min(node.text.length, op.offset);

  node.text.insertAt(offset, ...op.text.split(''));

  return doc;
}
