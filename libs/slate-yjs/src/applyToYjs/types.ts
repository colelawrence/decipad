import type { TOperation } from '@udecode/plate-common';
import type { SharedType } from '../model';

export type ApplyFunc<O extends TOperation = TOperation> = (
  sharedType: SharedType,
  op: O
) => SharedType;

export type OpMapper<O extends TOperation = TOperation> = {
  [K in O['type']]: O extends { type: K } ? ApplyFunc<O> : never;
};
