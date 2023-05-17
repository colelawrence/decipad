import {
  ELEMENT_TABLE,
  TableColumnFormulaElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useEditorChange } from '@decipad/editor-hooks';
import { useCallback } from 'react';
import { findNodePath, getNode } from '@udecode/plate';

export const useTableColumnHeaderOfTableAbove = (
  element: TableColumnFormulaElement,
  columnId: string
): TableHeaderElement | undefined => {
  return useEditorChange(
    useCallback(
      (editor): TableHeaderElement | undefined => {
        const path = findNodePath(editor, element);
        if (path) {
          const tablePath = path.slice(0, -2);
          const table = getNode(editor, tablePath);
          if (table) {
            assertElementType(table, ELEMENT_TABLE);
            const firstRow = table.children[1];
            return firstRow.children.find((th) => th.id === columnId);
          }
        }
        return undefined;
      },
      [columnId, element]
    )
  );
};
