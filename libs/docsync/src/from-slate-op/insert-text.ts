import { getTarget } from '../utils/path';
import { ExtendedSlateInsertTextOperation, SyncValue } from '../types';

export function insertText(
  doc: SyncValue,
  op: ExtendedSlateInsertTextOperation
): SyncValue {
  const node = getTarget(doc, op.path);

  const offset = Math.min(node.text.length, op.offset);

  node.text.insertAt(offset, ...op.text.split(''));

  return doc;
}
