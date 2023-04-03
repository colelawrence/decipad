import {
  CellValueType,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useEditorSelector } from '@decipad/react-contexts';
import { getNodeString } from '@udecode/plate';
import { useColumnsInferredTypes } from './useColumnsInferredTypes';

export interface TableColumn {
  blockId: string;
  name: string;
  cellType: CellValueType;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
  headers: TableHeaderElement[];
  rowCount: number;
}

export const useTable = (element: TableElement): TableInfo => {
  const columnTypes = useColumnsInferredTypes(element);

  return useEditorSelector(() => {
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
  });
};
