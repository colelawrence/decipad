import { CellValueType, TableElement } from '@decipad/editor-types';
import { useEditorChange } from '@decipad/editor-hooks';
import { getNodeString } from '@udecode/plate';
import { useCallback } from 'react';
import { TableInfo } from '../types';

export const useTableInfo = (
  element: TableElement,
  columnTypes?: CellValueType[]
): TableInfo | undefined => {
  const getTableInfo = useCallback(() => {
    if (!columnTypes) {
      return undefined;
    }
    return {
      name: getNodeString(element.children[0].children[0]),
      headers: element.children[1]?.children ?? [],
      columns:
        element.children[1]?.children.map((th, index) => ({
          blockId: th.id,
          name: getNodeString(th),
          cellType: columnTypes[index] ?? { kind: 'nothing' },
        })) ?? [],
      rowCount: element.children.length - 2,
    };
  }, [columnTypes, element.children]);

  return useEditorChange(getTableInfo);
};
