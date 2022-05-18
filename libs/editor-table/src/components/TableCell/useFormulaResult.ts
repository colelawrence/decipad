import { findNodePath } from '@udecode/plate';
import { dequal } from 'dequal';
import { useEffect, useState } from 'react';
import { distinctUntilChanged, map, Observable } from 'rxjs';

import {
  ELEMENT_TD,
  MyElement,
  MyReactEditor,
  useTEditorRef,
} from '@decipad/editor-types';
import { Computer, Result } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { useEditorTableContext } from '../../contexts/EditorTableContext';

function subscribeToFormulaResult(
  computer: Computer,
  blockId: string,
  rowIndex: number,
  columnIndex: number
): Observable<Result<'table'> | null> {
  return computer.results.pipe(
    map((computeRes) => {
      const table = computeRes.blockResults[blockId]?.results[0] as
        | Result<'table'>
        | undefined;

      if (table == null || table.type.kind !== 'table') {
        return null;
      }
      return table;
    }),
    distinctUntilChanged(dequal),
    map((table) => {
      if (table) {
        const type = table.type.columnTypes[columnIndex];
        const value = table.value[columnIndex]?.[rowIndex];
        if (type && value) {
          return { type, value };
        }
      }
      return null;
    })
  );
}

const findFormulaCoordinates = (
  editor: MyReactEditor,
  element: MyElement
): [rowIdx: number, colIdx: number] => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const path = findNodePath(editor, element)!;
  const headerRowCount = 2; // skip caption and column headers
  const rowIndex = path[path.length - 2] - headerRowCount;
  const colIndex = path[path.length - 1];

  return [rowIndex, colIndex];
};

export function useFormulaResult(element: MyElement): Result<'table'> | null {
  const editor = useTEditorRef();
  const computer = useComputer();
  const [result, setResult] = useState<Result<'table'> | null>(null);
  const tableContext = useEditorTableContext();

  const [rowIndex, colIndex] = findFormulaCoordinates(editor, element);

  useEffect(() => {
    if (element.type === ELEMENT_TD) {
      if (tableContext.cellTypes[colIndex]?.kind === 'table-formula') {
        const sub = subscribeToFormulaResult(
          computer,
          tableContext.blockId,
          rowIndex,
          colIndex
        ).subscribe(setResult);

        return () => sub.unsubscribe();
      }
      // When switching away from the "formula" type, remove the CodeResult element.
      setResult(null);
    }

    return noop;
  }, [computer, element, tableContext, rowIndex, colIndex]);

  return result;
}
