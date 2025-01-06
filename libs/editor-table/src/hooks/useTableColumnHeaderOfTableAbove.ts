import type { TableColumnFormulaElement } from '@decipad/editor-types';
import { ELEMENT_TABLE } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useEditorChange } from '@decipad/editor-hooks';
import { useCallback } from 'react';
import { findNodePath, getNode, getNodeString } from '@udecode/plate-common';

export const useTableColumnHeaderOfTableAbove = (
  element: TableColumnFormulaElement,
  columnId: string
): string | undefined => {
  return useEditorChange(
    useCallback(
      (editor): string | undefined => {
        if (element.varName != null) {
          return element.varName;
        }

        const path = findNodePath(editor, element);
        if (path) {
          const tablePath = path.slice(0, -2);
          const table = getNode(editor, tablePath);
          if (table) {
            assertElementType(table, ELEMENT_TABLE);
            const firstRow = table.children[1];
            const header = firstRow.children.find((th) => th.id === columnId);
            return header && getNodeString(header);
          }
        }
        return undefined;
      },
      [columnId, element]
    )
  );
};
