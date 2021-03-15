import { getTarget } from "../utils/path";
import { InsertTextOperation } from "slate";

import { SyncValue } from "../model";

function insertText(doc: SyncValue, op: InsertTextOperation): SyncValue {
  const node = getTarget(doc, op.path);

  const offset = Math.min(node.text.length, op.offset);

  node.text.insertAt(offset, ...op.text.split(""));

  return doc;
}

export { insertText };
