import {
  CellValueType,
  TableColumnFormulaElement,
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
  formulas: TableColumnFormulaElement[];
  rowCount: number;
}

export const useTable = (element: TableElement): TableInfo => {
  const { types: columnTypes } = useColumnsInferredTypes(element);

  return useEditorSelector(() => {
    return {
      name: getNodeString(element.children[0].children[0]),
      headers: element.children[1]?.children ?? [],
      columns:
        element.children[1]?.children.map((th, index) => ({
          blockId: th.id,
          name: th.children[0].text,
          cellType: columnTypes[index] ?? { kind: 'nothing' },
        })) ?? [],
      formulas: element.children[0].children.slice(
        1
      ) as TableColumnFormulaElement[],
      rowCount: element.children.length - 2,
    };
  });
};
