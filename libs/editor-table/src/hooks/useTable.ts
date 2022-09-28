import {
  CellValueType,
  TableColumnFormulaElement,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useEditorChange } from '@decipad/react-contexts';
import { getNodeString } from '@udecode/plate';
import { dequal } from 'dequal';
import { useCallback, useMemo, useState } from 'react';
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
  const getName = useCallback(() => {
    return getNodeString(element.children[0].children[0]);
  }, [element.children]);

  const getHeaders = useCallback(() => {
    return element.children[1].children;
  }, [element.children]);

  const { types: columnTypes } = useColumnsInferredTypes(element);

  const getColumns = useCallback(() => {
    const headers = element.children[1]?.children ?? [];

    return headers.map((th, index) => ({
      blockId: th.id,
      name: th.children[0].text,
      cellType: columnTypes[index],
    }));
  }, [columnTypes, element.children]);

  const getFormulas = useCallback(() => {
    return element.children[0].children.slice(1) as TableColumnFormulaElement[];
  }, [element.children]);

  const getRowCount = useCallback(() => {
    return element.children.length - 2;
  }, [element.children.length]);

  const [name, setName] = useState<TableInfo['name']>(getName);
  const [headers, setHeaders] = useState<TableInfo['headers']>(getHeaders);
  const [columns, setColumns] = useState<TableInfo['columns']>(getColumns);
  const [formulas, setFormulas] = useState<TableInfo['formulas']>(getFormulas);
  const [rowCount, setRowCount] = useState<number>(getRowCount);

  useEditorChange(
    ({
      name: newName,
      headers: newHeaders,
      columns: newColumns,
      formulas: newFormulas,
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
      if (!dequal(formulas, newFormulas)) {
        setFormulas(newFormulas);
      }
      if (!dequal(rowCount, newRowCount)) {
        setRowCount(newRowCount);
      }
    },
    () => ({
      name: getName(),
      headers: getHeaders(),
      columns: getColumns(),
      formulas: getFormulas(),
      rowCount: getRowCount(),
    })
  );

  return useMemo(
    () => ({ name, headers, columns, formulas, rowCount }),
    [name, headers, columns, formulas, rowCount]
  );
};
