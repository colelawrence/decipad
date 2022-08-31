import { findNodePath } from '@udecode/plate';
import { dequal } from 'dequal';
import { useEffect, useState } from 'react';
import { distinctUntilChanged, map, Observable, Subscription } from 'rxjs';

import { Computer, Result } from '@decipad/computer';
import {
  MyReactEditor,
  TableCellElement,
  TableHeaderElement,
  useTEditorRef,
} from '../../editor-types/src';
import { useComputer } from './computer';
import { useEditorTableContext } from './editor-table';

function formulaResult$(
  computer: Computer,
  blockId: string,
  columnIndex: number,
  rowIndex?: number
): Observable<Result.Result | null> {
  return computer.results.pipe(
    map((computeRes) => {
      const table = computeRes.blockResults[blockId]?.result as
        | Result.Result<'table'>
        | undefined;

      if (table == null || table.type.kind !== 'table') {
        return null;
      }
      return table;
    }),
    distinctUntilChanged(dequal),
    map((table) => {
      if (table) {
        let type = table.type.columnTypes[columnIndex];
        let value = table.value[columnIndex];
        if (value && rowIndex != null) {
          value = value[rowIndex];
        } else {
          type = {
            kind: 'column',
            cellType: type,
            columnSize: table.type.tableLength,
          };
        }

        if (type != null && value != null) {
          return { type, value };
        }
      }
      return null;
    }),
    distinctUntilChanged(dequal)
  );
}

const findFormulaCoordinates = (
  editor: MyReactEditor,
  element: TableCellElement | TableHeaderElement | undefined
): [rowIdx: number, colIdx: number] | undefined => {
  const path = element && findNodePath(editor, element);
  if (!path) {
    return;
  }
  const headerRowCount = 2; // skip caption and column headers
  const rowIndex = path[path.length - 2] - headerRowCount;
  const colIndex = path[path.length - 1];

  return [rowIndex, colIndex];
};

export function useTableColumnFormulaResultForElement(
  element: TableCellElement | TableHeaderElement
): Result.Result | null {
  const editor = useTEditorRef();
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result | null>(null);
  const tableContext = useEditorTableContext();

  const coordinates = findFormulaCoordinates(editor, element);

  useEffect(() => {
    if (!coordinates || !element) {
      return;
    }
    const [rowIndex, colIndex] = coordinates;
    let sub: Subscription;
    if (tableContext.cellTypes[colIndex]?.kind === 'table-formula') {
      sub = formulaResult$(
        computer,
        tableContext.blockId,
        colIndex,
        rowIndex
      ).subscribe((newResult) => {
        if (!dequal(result, newResult)) {
          setResult(newResult);
        }
      });
    } else {
      // When switching away from the "formula" type, remove the CodeResult element.
      setResult(null);
    }

    return () => sub?.unsubscribe();
  }, [computer, element, tableContext, coordinates, result]);

  return result;
}

export function useTableColumnFormulaResultForColumn(
  colIndex: number
): Result.Result | null {
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result | null>(null);
  const tableContext = useEditorTableContext();

  useEffect(() => {
    let sub: Subscription;
    if (tableContext.cellTypes[colIndex]?.kind === 'table-formula') {
      sub = formulaResult$(computer, tableContext.blockId, colIndex).subscribe(
        setResult
      );
    } else {
      // When switching away from the "formula" type, remove the CodeResult element.
      setResult(null);
    }

    return () => sub?.unsubscribe();
  }, [computer, tableContext, colIndex]);

  return result;
}
