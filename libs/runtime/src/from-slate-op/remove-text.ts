import { RemoveTextOperation } from "slate";
import { getTarget } from "../utils/path";

function removeText(doc: SyncPadValue, op: RemoveTextOperation): SyncPadValue {
  const node = getTarget(doc, op.path);

  const offset = Math.min(node.text.length, op.offset);

  node.text.deleteAt(offset, op.text.length);

  return doc;
}

export { removeText };
