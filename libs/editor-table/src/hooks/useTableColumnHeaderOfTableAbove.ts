import {
  ELEMENT_TABLE,
  MyElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, useElementAbove } from '@decipad/editor-utils';
import { isTable } from '../utils/isTable';

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
