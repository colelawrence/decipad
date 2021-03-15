import { MoveNodeOperation } from "slate";

import { SyncValue } from "../model";
import { cloneNode } from "../utils/clone-node";
import { getParent, getChildren } from "../utils/path";

function moveNode(doc: SyncValue, op: MoveNodeOperation): SyncValue {
  const [from, fromIndex] = getParent(doc, op.path);
  const [to, toIndex] = getParent(doc, op.newPath);

  if (from.text || to.text) {
    throw new TypeError("Can't move node as child of a text node");
  }

  getChildren(to).splice(
    toIndex,
    0,
    ...getChildren(from).splice(fromIndex, 1).map(cloneNode)
  );

  return doc;
}

export { moveNode };
