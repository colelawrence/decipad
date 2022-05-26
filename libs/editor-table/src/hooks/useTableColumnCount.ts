import { ELEMENT_TABLE, MyElement, useTEditorRef } from '@decipad/editor-types';
import { assertElementType, useElementAbove } from '@decipad/editor-utils';
import { isTable } from '../utils/isTable';

export const useTableColumnCount = (element: MyElement): number | undefined => {
  const editor = useTEditorRef();
  const table = useElementAbove(editor, element, { match: isTable });
  if (table) {
    assertElementType(table, ELEMENT_TABLE);
    return table.children[1]?.children.length;
  }
  return undefined;
};
