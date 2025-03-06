import {
  insertNodes as plateInsertNodes,
  type Value,
  type EElementOrText,
  type TEditor,
  type InsertNodesOptions,
} from '@udecode/plate-common';

type InsertNodes = <N extends EElementOrText<V>, V extends Value = Value>(
  editor: TEditor<V>,
  nodes: N[],
  options?: InsertNodesOptions<V> | undefined
) => void;

export const insertNodes: InsertNodes = (editor, options, ...args) => {
  return plateInsertNodes(editor, options, ...args);
};
