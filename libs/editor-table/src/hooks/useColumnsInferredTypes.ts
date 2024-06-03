import { useEffect, useState } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { findNodePath, getNode, getNodeString } from '@udecode/plate-common';
import {
  type MyEditor,
  type TableCellElement,
  type CellValueType,
  type TableElement,
  type TableHeaderElement,
  useMyEditorRef,
} from '@decipad/editor-types';
import { inferColumn } from '@decipad/parse';

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
): CellValueType[] | undefined => {
  const computer = useComputer();
  const editor = useMyEditorRef();
  const [tableTypes, setTableTypes] = useState<CellValueType[] | undefined>();

  useEffect(() => {
    (async () => {
      const columnsData = collectColumnsData(editor, element);
      const headerCells = element.children[1].children;
      const newTableTypes = await Promise.all(
        columnsData.map((columnData, columnIndex) =>
          inferColumn(computer, columnData, {
            userType: headerCells[columnIndex]?.cellType,
            doNotInferBoolean: true,
          })
        )
      );
      setTableTypes(newTableTypes);
    })();
  }, [computer, editor, element]);

  return tableTypes;
};
