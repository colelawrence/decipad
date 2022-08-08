import {
  TableCellType,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useEditorChange } from '@decipad/react-contexts';
import { getNodeString } from '@udecode/plate';
import { dequal } from 'dequal';
import { useCallback, useMemo, useState } from 'react';

export interface TableColumn {
  name: string;
  cellType: TableCellType;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
  headers: TableHeaderElement[];
  rowCount: number;
}

export const useTable = (element: TableElement): TableInfo => {
  const getName = useCallback(() => {
    return getNodeString(element.children[0].children[0]);
  }, [element.children]);

  const getHeaders = useCallback(() => {
    return element.children[1].children;
  }, [element.children]);

  const getColumns = useCallback(() => {
    const headers = element.children[1].children;

    return headers.map((th) => ({
      name: th.children[0].text,
      cellType: th.cellType,
    }));
  }, [element.children]);

  const getRowCount = useCallback(() => {
    return element.children.length - 2;
  }, [element.children.length]);

  const [name, setName] = useState<TableInfo['name']>(getName);
  const [headers, setHeaders] = useState<TableInfo['headers']>(getHeaders);
  const [columns, setColumns] = useState<TableInfo['columns']>(getColumns);
  const [rowCount, setRowCount] = useState<number>(getRowCount);

  useEditorChange(
    ({
      name: newName,
      headers: newHeaders,
      columns: newColumns,
      rowCount: newRowCount,
    }) => {
      if (!dequal(name, newName)) {
        setName(newName);
      }
      if (!dequal(headers, newHeaders)) {
        setHeaders(newHeaders);
      }
      if (!dequal(columns, newColumns)) {
        setColumns(newColumns);
      }
      if (!dequal(rowCount, newRowCount)) {
        setRowCount(newRowCount);
      }
    },
    () => ({
      name: getName(),
      headers: getHeaders(),
      columns: getColumns(),
      rowCount: getRowCount(),
    })
  );

  return useMemo(
    () => ({ name, headers, columns, rowCount }),
    [name, headers, columns, rowCount]
  );
};
