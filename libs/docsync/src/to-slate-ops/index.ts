import { toJS } from '../utils/to-js';
import { opInsert } from './insert';
import { opRemove } from './remove';
import { opSet } from './set';
import { opCreate } from './create';
import {
  SyncDiff,
  SyncDoc,
  SyncDocValue,
  ExtendedSlateOperation,
} from '../types';

const byAction = {
  create: opCreate,
  remove: opRemove,
  set: opSet,
  insert: opInsert,
};

const rootKey = '00000000-0000-0000-0000-000000000000';

export function toSlateOps(
  ops: SyncDiff[],
  doc: SyncDoc<{ value: SyncDocValue }>,
  before: SyncDoc<{ value: SyncDocValue }>
): ExtendedSlateOperation[] {
  function iterate(acc: [any, any[]], op: SyncDiff): any {
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
