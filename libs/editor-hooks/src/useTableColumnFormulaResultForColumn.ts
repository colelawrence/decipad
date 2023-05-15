import { findNodePath } from '@udecode/plate';
import { Result, isTableResult } from '@decipad/computer';
import {
  MyReactEditor,
  TableCellElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useEditorTableResultContext } from '@decipad/react-contexts';
import { useMemo } from 'react';
import { all } from '@decipad/generator-utils';
import { useResolved } from '@decipad/react-utils';

export function useTableColumnFormulaResultForCell(
  element: TableCellElement | TableHeaderElement
): Result.Result | undefined {
  const editor = useTEditorRef();
  const [rowIndex, colIndex] = findFormulaCoordinates(editor, element);
  const columnResult = useTableColumnFormulaResultForColumn(colIndex);
  return useMemo(
    () =>
      rowIndex != null && columnResult?.type.kind === 'materialized-column'
        ? {
            type: columnResult.type.cellType,
            value: columnResult.value[rowIndex] as Result.OneResult,
          }
        : undefined,
    [columnResult, rowIndex]
  );
}

export function useTableColumnFormulaResultForColumn(
  colIndex?: number
): Result.Result<'materialized-column'> | undefined {
  const tableResult = useEditorTableResultContext();
  return useResolved(
    useMemo(
      async () =>
        isTableResult(tableResult)
          ? getColumnResult(
              tableResult as Result.Result<'table' | 'materialized-table'>,
              colIndex
            )
          : undefined,
      [colIndex, tableResult]
    )
  );
}

const findFormulaCoordinates = (
  editor: MyReactEditor,
  element: TableCellElement | TableHeaderElement | undefined
) => {
  const path = element && findNodePath(editor, element);
  if (!path) {
    return [undefined, undefined] as const;
  }
  const headerRowCount = 2; // skip caption and column headers
  const rowIndex = path[path.length - 2] - headerRowCount;
  const colIndex = path[path.length - 1];

  return [rowIndex, colIndex] as const;
};

const getColumnResult = async (
  result: Result.Result<'table' | 'materialized-table'>,
  columnIndex?: number
): Promise<Result.Result<'materialized-column'> | undefined> => {
  if (columnIndex != null) {
    const value = await getColumnResultValue(result, columnIndex);
    if (value != null) {
      return {
        type: {
          kind: 'materialized-column',
          indexedBy: result.type.indexName,
          cellType: result.type.columnTypes[columnIndex],
        },
        value,
      };
    }
  }
  return undefined;
};

const getColumnResultValue = async (
  result: Result.Result<'table' | 'materialized-table'>,
  columnIndex?: number
): Promise<Result.Result<'materialized-column'>['value'] | undefined> => {
  const columnValue =
    columnIndex != null ? result.value[columnIndex] : undefined;
  if (columnValue != null) {
    return typeof columnValue === 'function' ? all(columnValue()) : columnValue;
  }
  return undefined;
};
