import {
  ELEMENT_TABLE,
  MyElement,
  TableElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, useElementAbove } from '@decipad/editor-utils';
import { isElement } from '@udecode/plate';
import { Node } from 'slate';

const isTable = (node: Node): node is TableElement => {
  return isElement(node) && node.type === ELEMENT_TABLE;
};

export const useTableColumnHeaderOfTableAbove = (
  element: MyElement,
  columnId: string
): TableHeaderElement | undefined => {
  const editor = useTEditorRef();
  const table = useElementAbove(editor, element, { match: isTable });

  if (table) {
    assertElementType(table, ELEMENT_TABLE);
    const firstRow = table.children[1];
    return firstRow.children.find((th) => th.id === columnId);
  }
  return undefined;
};
