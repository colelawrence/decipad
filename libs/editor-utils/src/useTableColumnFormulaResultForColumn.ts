import { findNodePath } from '@udecode/plate';
import { dequal } from 'dequal';
import { useEffect, useState } from 'react';
import {
  distinctUntilChanged,
  map,
  mergeMap,
  Observable,
  Subscription,
} from 'rxjs';

import { IdentifiedError, IdentifiedResult, Result } from '@decipad/computer';
import {
  MyReactEditor,
  TableCellElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useComputer, useEditorTableContext } from '@decipad/react-contexts';
import { OneResult } from 'libs/language/src/result';

function formulaResult$(
  blockResult$: Observable<
    Readonly<IdentifiedResult> | Readonly<IdentifiedError> | undefined
  >,
  columnIndex: number,
  rowIndex?: number
): Observable<Result.Result | null> {
  return blockResult$.pipe(
    mergeMap((result) => {
      if (result?.result?.type.kind === 'table') {
        return [result.result as Result.Result<'table'>];
      }
      return [];
    }),
    map((table) => {
      let type = table.type.columnTypes.at(columnIndex);
      let value: OneResult | undefined = table.value.at(columnIndex);
      if (value && rowIndex != null) {
        value = value[rowIndex];
      } else if (type) {
        type = {
          kind: 'column',
          cellType: type,
          columnSize: 'unknown',
          indexedBy: table.type.indexName,
        };
      }

      return (type && value != null && { type, value }) || undefined;
    }),
    distinctUntilChanged(dequal)
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

export function useTableColumnFormulaResultForElement(
  element: TableCellElement | TableHeaderElement
): Result.Result | null {
  const editor = useTEditorRef();
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result | null>(null);
  const tableContext = useEditorTableContext();

  const [rowIndex, colIndex] = findFormulaCoordinates(editor, element);

  useEffect(() => {
    if (rowIndex == null || colIndex == null || !element) {
      return;
    }
    let sub: Subscription;
    if (tableContext.cellTypes[colIndex]?.kind === 'table-formula') {
      sub = formulaResult$(
        computer.getBlockIdResult$.observe(tableContext.blockId),
        colIndex,
        rowIndex
      ).subscribe(setResult);
    } else {
      // When switching away from the "formula" type, remove the CodeResult element.
      setResult(null);
    }

    return () => sub?.unsubscribe();
  }, [computer, element, tableContext, rowIndex, colIndex]);

  return result;
}

export function useTableColumnFormulaResultForColumn(
  colIndex?: number
): Result.Result | null {
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result | null>(null);
  const tableContext = useEditorTableContext();

  useEffect(() => {
    let sub: Subscription;
    if (
      colIndex &&
      tableContext.cellTypes[colIndex]?.kind === 'table-formula'
    ) {
      sub = formulaResult$(
        computer.getBlockIdResult$.observe(tableContext.blockId),
        colIndex
      ).subscribe(setResult);
    } else {
      // When switching away from the "formula" type, remove the CodeResult element.
      setResult(null);
    }

    return () => sub?.unsubscribe();
  }, [computer, tableContext, colIndex]);

  return result;
}
