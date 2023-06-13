import { useComputer } from '@decipad/react-contexts';
import { findNodePath, getNode, getNodeString } from '@udecode/plate';
import {
  MyEditor,
  TableCellElement,
  CellValueType,
  TableHeaderElement,
} from '@decipad/editor-types';
import { inferColumn } from '@decipad/parse';
import { Computer } from '@decipad/computer';
import { useCallback } from 'react';
import { useEditorChangePromise } from '@decipad/editor-hooks';

type UseColumnInferredTypeResult = CellValueType | undefined;

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

export const getColumnInferredType = async (
  editor: MyEditor,
  computer: Computer,
  element?: TableHeaderElement
): Promise<UseColumnInferredTypeResult | undefined> => {
  if (element && element.cellType?.kind !== 'anything') {
    return element.cellType;
  }
  return (
    element &&
    inferColumn(computer, collectColumnData(editor, element), {
      userType: element.cellType,
    })
  );
};

export const useColumnInferredType = (
  element?: TableHeaderElement
): UseColumnInferredTypeResult => {
  const computer = useComputer();
  return useEditorChangePromise(
    useCallback(
      (editor: MyEditor) => getColumnInferredType(editor, computer, element),
      [computer, element]
    )
  );
};
