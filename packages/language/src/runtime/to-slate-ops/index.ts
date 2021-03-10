import { Diff } from "automerge";

import { toJS } from "../utils/to-js";

import { opInsert } from "./insert";
import { opRemove } from "./remove";
import { opSet } from "./set";
import { opCreate } from "./create";

import { SyncDoc } from "../model";

const byAction = {
  create: opCreate,
  remove: opRemove,
  set: opSet,
  insert: opInsert,
};

const rootKey = "00000000-0000-0000-0000-000000000000";

function toSlateOps(ops: Diff[], doc: SyncDoc, before: SyncDoc) {
  function iterate(acc: [any, any[]], op: Diff): any {
    const action = byAction[op.action];

    const result = action ? action(op, acc, doc, before) : acc;

    return result;
  }

  const [tempTree, defer] = ops.reduce(iterate, [
    {
      [rootKey]: {},
    },
    [],
  ]);

  const tempDoc = toJS(doc);

  return defer.flatMap((op) => op(tempTree, tempDoc)).filter((op) => op);
}

export { toSlateOps };
