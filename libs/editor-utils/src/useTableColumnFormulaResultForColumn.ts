import { findNodePath } from '@udecode/plate';
import { dequal } from 'dequal';
import { useEffect, useState } from 'react';
import { distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { Computer, Result } from '@decipad/computer';
import {
  MyEditor,
  TableCellElement,
  TableColumnFormulaElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useComputer, useEditorTableContext } from '@decipad/react-contexts';
import { getNullReplacementValue } from '@decipad/parse';

function formulaResult$(
  computer: Computer,
  blockId: string,
  rowIndex?: number
): Observable<Result.Result | null> {
  return computer.results.pipe(
    map((computeRes) => {
      const column = computeRes.blockResults[blockId]?.result as
        | Result.Result<'column' | 'type-error'>
        | undefined;

      const kind = column?.type.kind;
      if (kind !== 'column' && kind !== 'type-error') {
        return null;
      }
      return column;
    }),
    distinctUntilChanged(dequal),
    map((column: Result.Result<'column' | 'type-error'>) => {
      if (!column || rowIndex == null || column.type.kind === 'type-error') {
        return column;
      }
      const columnResult = column as Result.Result<'column'>;
      return {
        type: columnResult.type.cellType,
        value:
          columnResult.value[rowIndex] ??
          getNullReplacementValue(column.type.cellType),
      };
    }),
    distinctUntilChanged(dequal)
  );
}

const findFormulaCoordinates = (
  editor: MyEditor,
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
    const type = tableContext.cellTypes[colIndex];
    const blockId = tableContext.columnBlockIds[colIndex];
    if (type?.kind === 'table-formula' && blockId) {
      sub = formulaResult$(computer, blockId, rowIndex).subscribe(setResult);
    } else {
      // When switching away from the "formula" type, remove the CodeResult element.
      setResult(null);
    }

    return () => sub?.unsubscribe();
  }, [computer, element, tableContext, rowIndex, colIndex]);

  return result;
}

export function useTableColumnFormulaResultForFormula(
  element: TableColumnFormulaElement
): Result.Result | null {
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result | null>(null);
  const tableContext = useEditorTableContext();

  useEffect(() => {
    const sub = formulaResult$(computer, element.id).subscribe(setResult);

    return () => sub?.unsubscribe();
  }, [computer, element, tableContext]);

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
    const type = tableContext.cellTypes[colIndex];
    const blockId = tableContext.columnBlockIds[colIndex];
    if (type?.kind === 'table-formula' && blockId) {
      sub = formulaResult$(computer, blockId).subscribe(setResult);
    } else {
      // When switching away from the "formula" type, remove the CodeResult element.
      setResult(null);
    }

    return () => sub?.unsubscribe();
  }, [computer, tableContext, colIndex]);

  return result;
}
