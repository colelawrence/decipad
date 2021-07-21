import { Operation } from 'slate';
import { insertNode } from './insert-node';
import { insertText } from './insert-text';
import { mergeNode } from './merge-node';
import { moveNode } from './move-node';
import { removeNode } from './remove-node';
import { removeText } from './remove-text';
import { setNode } from './set-node';
import { splitNode } from './split-node';

const slateOpTypes = {
  insert_node: insertNode,
  insert_text: insertText,
  merge_node: mergeNode,
  move_node: moveNode,
  remove_node: removeNode,
  remove_text: removeText,
  set_node: setNode,
  split_node: splitNode,
};

export type SupportedSlateOpTypes = keyof typeof slateOpTypes;

type OpApplier = (
  doc: SyncValue,
  op: ExtendedSlate.ExtendedSlateOperation
) => SyncValue;

export function fromSlateOpType(type: SupportedSlateOpTypes): OpApplier | null {
  return (slateOpTypes[type] as OpApplier) ?? null;
}

export function isSupportedSlateOpType(
  op: Operation | ExtendedSlate.ExtendedSlateOperation
): op is ExtendedSlate.ExtendedSlateOperation {
  return {}.hasOwnProperty.call(slateOpTypes, op.type);
}
