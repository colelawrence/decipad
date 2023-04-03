import { useCallback, useState } from 'react';
import { useComputer, useEditorChange } from '@decipad/react-contexts';
import { findNodePath, getNode, getNodeString } from '@udecode/plate';
import {
  MyEditor,
  TableCellElement,
  CellValueType,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { inferColumn } from '@decipad/parse';

export type UseColumnInferredTypeResult = CellValueType[];

const collectColumnData = (
  editor: MyEditor,
  element: TableHeaderElement
): string[] => {
  const columnData: string[] = [];
  const path = findNodePath(editor, element);
  if (path) {
    const tablePath = path?.slice(0, -2);
    const columnIndex = path[path.length - 1];
    let rowIndex = 0;
    let columnEnded = false;
    while (!columnEnded) {
      const dataPath = [...tablePath, rowIndex + 2, columnIndex];
      const node = getNode<TableCellElement>(editor, dataPath);
      if (!node) {
        columnEnded = true;
      } else {
        columnData.push(getNodeString(node));
      }
      rowIndex += 1;
    }
  }
  return columnData;
};

const collectColumnsData = (
  editor: MyEditor,
  element: TableElement
): string[][] => {
  const headerRow = element.children[1];
  return headerRow.children.map((th) => collectColumnData(editor, th));
};

export const useColumnsInferredTypes = (
  element: TableElement
): UseColumnInferredTypeResult => {
  const computer = useComputer();
  const [types, setTypes] = useState<CellValueType[]>(() =>
    element.children[1].children.map((th) => th.cellType)
  );

  const inferColumnsTypes = useCallback(
    (editor: MyEditor): CellValueType[] => {
      const columnsData = collectColumnsData(editor, element);
      const headerCells = element.children[1].children;
      return columnsData.map((columnData, columnIndex) =>
        inferColumn(computer, columnData, {
          userType: headerCells[columnIndex]?.cellType,
        })
      );
    },
    [computer, element]
  );

  useEditorChange(setTypes, inferColumnsTypes);

  return types;
};
