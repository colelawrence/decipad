import {
  ELEMENT_TABLE,
  isElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { assertElementType, useElementAbove } from '@decipad/editor-utils';
import { usePlateEditorRef } from '@udecode/plate';
import { Node } from 'slate';

const isTable = (node: Node) => {
  return isElement(node) && node.type === ELEMENT_TABLE;
};

export const useTableColumnHeaderOfTableAbove = (
  element: Node,
  columnId: string
): TableHeaderElement | undefined => {
  const editor = usePlateEditorRef();
  const table = useElementAbove(editor, element, { match: isTable });

  if (table) {
    assertElementType(table, ELEMENT_TABLE);
    const firstRow = table.children[1];
    return firstRow.children.find((th) => th.id === columnId);
  }
  return undefined;
};
