import { SyncValue } from "../model";
import { Operation as SlateOperation } from "slate";
import { insertNode } from "./insert-node";
import { mergeNode } from "./merge-node";
import { moveNode } from "./move-node";
import { removeNode } from "./remove-node";
import { setNode } from "./set-node";
import { splitNode } from "./split-node";
import { insertText } from "./insert-text";
import { removeText } from "./remove-text";

export type SupportedSlateOpTypes =
  | "insert_node"
  | "merge_node"
  | "move_node"
  | "remove_node"
  | "set_node"
  | "split_node"
  | "insert_text"
  | "remove_text";

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

export function fromSlateOpType(
  type: SupportedSlateOpTypes
): (doc: SyncValue, op: SlateOperation) => SyncValue {
  return slateOpTypes[type] as (
    doc: SyncValue,
    op: SlateOperation
  ) => SyncValue;
}
