import { getTarget } from '../utils/path';

function insertText(
  doc: SyncPadValue,
  op: ExtendedSlate.ExtendedSlateInsertTextOperation
): SyncPadValue {
  const node = getTarget(doc, op.path);

  const offset = Math.min(node.text.length, op.offset);

  node.text.insertAt(offset, ...op.text.split(''));

  return doc;
}

export { insertText };
