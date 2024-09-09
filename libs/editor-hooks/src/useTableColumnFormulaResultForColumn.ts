import { useMemo } from 'react';
import { findNodePath } from '@udecode/plate-common';
import type { Result } from '@decipad/language-interfaces';
import type {
  MyReactEditor,
  TableCellElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { useEditorTableResultContext } from '@decipad/react-contexts';
import { all } from '@decipad/generator-utils';
import { useResolved } from '@decipad/react-utils';
import { isTableResult } from '@decipad/computer-utils';
import { buildResult } from '@decipad/language-types';

export function useTableColumnFormulaResultForCell(
  element: TableCellElement | TableHeaderElement | undefined
): Result.Result | undefined {
  const editor = useMyEditorRef();
  const [rowIndex, colIndex] = findFormulaCoordinates(editor, element);
  const columnResult = useTableColumnFormulaResultForColumn(colIndex);
  return useMemo(
    () =>
      rowIndex != null && columnResult?.type.kind === 'materialized-column'
        ? (buildResult(
            columnResult.type.cellType,
            columnResult.value[rowIndex]
          ) as Result.Result)
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
    ) as Promise<Result.Result<'materialized-column'>> | undefined
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
        meta: result.meta,
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
