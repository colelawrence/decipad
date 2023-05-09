import { useCallback } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { findNodePath, getNode, getNodeString } from '@udecode/plate';
import {
  MyEditor,
  TableCellElement,
  CellValueType,
  TableHeaderElement,
} from '@decipad/editor-types';
import { inferColumn } from '@decipad/parse';
import { useResolved } from '@decipad/react-utils';
import { useEditorSelector } from '../../../react-contexts/src/editor-change';

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

export const useColumnInferredType = (
  element?: TableHeaderElement
): UseColumnInferredTypeResult => {
  const computer = useComputer();

  const inferColumnType = useCallback(
    async (editor: MyEditor): Promise<CellValueType | undefined> => {
      if (element && element.cellType?.kind !== 'anything') {
        return element.cellType;
      }
      return (
        element &&
        inferColumn(computer, collectColumnData(editor, element), {
          userType: element.cellType,
        })
      );
    },
    [computer, element]
  );

  return useResolved(useEditorSelector(inferColumnType));
};
