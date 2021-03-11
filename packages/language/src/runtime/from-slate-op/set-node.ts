import { SetNodeOperation } from "slate";

import { SyncValue } from "../model";
import { getTarget } from "../utils/path";

function setNode(doc: SyncValue, op: SetNodeOperation): SyncValue {
  const node = getTarget(doc, op.path);

  const { newProperties } = op;

  for (const key in newProperties) {
    const value = newProperties[key];
    if (value !== undefined) {
      node[key] = value;
    } else {
      delete node[key];
    }
  }

  return doc;
}

export { setNode };
