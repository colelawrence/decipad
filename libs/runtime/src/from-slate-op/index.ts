import { insertNode } from './insert-node';
import { mergeNode } from './merge-node';
import { moveNode } from './move-node';
import { removeNode } from './remove-node';
import { setNode } from './set-node';
import { splitNode } from './split-node';
import { insertText } from './insert-text';
import { removeText } from './remove-text';

const slateOpTypes = {
  insert_node: insertNode,
  merge_node: mergeNode,
  move_node: moveNode,
  remove_node: removeNode,
  set_node: setNode,
  split_node: splitNode,
  insert_text: insertText,
  remove_text: removeText,
};

export type SupportedSlateOpTypes = keyof typeof slateOpTypes;

export function fromSlateOpType(
  type: SupportedSlateOpTypes
): (
  doc: SyncPadValue,
  op: ExtendedSlate.ExtendedSlateOperation
) => SyncPadValue {
  return slateOpTypes[type] as (
    doc: SyncPadValue,
    op: ExtendedSlate.ExtendedSlateOperation
  ) => SyncPadValue;
}
