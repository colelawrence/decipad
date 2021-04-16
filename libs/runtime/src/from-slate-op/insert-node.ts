import { InsertNodeOperation } from "slate";

import { getParent, getChildren } from "../utils/path";
import { toSync } from "../utils/to-sync";

function insertNode(doc: SyncPadValue, op: InsertNodeOperation): SyncPadValue {
  const [parent, index] = getParent(doc, op.path);

  if (Object.prototype.hasOwnProperty.call(parent, "text") === true) {
    throw new TypeError("Can't insert node into text node");
  }

  getChildren(parent).splice(index, 0, toSync(op.node));

  return doc;
}

export { insertNode };
