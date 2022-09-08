import { useCallback, useState } from 'react';
import { useComputer, useEditorChange } from '@decipad/react-contexts';
import { findNodePath, getNode, getNodeString } from '@udecode/plate';
import {
  MyEditor,
  TableCellElement,
  CellValueType,
  TableHeaderElement,
} from '@decipad/editor-types';
import { inferColumn } from '@decipad/parse';

interface UseColumnInferredTypeResult {
  type: CellValueType;
}

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

export const useColumnInferredType = (
  element: TableHeaderElement
): UseColumnInferredTypeResult => {
  const computer = useComputer();
  const [type, setType] = useState<CellValueType>(() => element.cellType);
  const inferColumnType = useCallback(
    (editor: MyEditor): Promise<CellValueType> =>
      inferColumn(computer, collectColumnData(editor, element), {
        userType: element.cellType,
      }),
    [computer, element]
  );

  const settleType = useCallback(async (tableCell: Promise<CellValueType>) => {
    const cellType = await tableCell;
    setType(cellType);
  }, []);

  useEditorChange(settleType, inferColumnType, { selectsPromise: true });

  return { type };
};
