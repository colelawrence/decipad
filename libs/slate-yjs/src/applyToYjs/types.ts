import { TOperation } from '@udecode/plate';
import { SharedType } from '../model';

export type ApplyFunc<O extends TOperation = TOperation> = (
  sharedType: SharedType,
  op: O
) => SharedType;

export type OpMapper<O extends TOperation = TOperation> = {
  [K in O['type']]: O extends { type: K } ? ApplyFunc<O> : never;
};
