import { findNodePath } from '@udecode/plate';
import { Result } from '@decipad/computer';
import {
  MyReactEditor,
  TableCellElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useComputer, useEditorTableContext } from '@decipad/react-contexts';

export function useTableColumnFormulaResultForCell(
  element: TableCellElement | TableHeaderElement
): Result.Result | undefined {
  const editor = useTEditorRef();
  const computer = useComputer();

  const [rowIndex, colIndex] = findFormulaCoordinates(editor, element);
  const columnBlockId = useColumnBlockId(colIndex);

  return computer.getBlockIdResult$.useWithSelector((result) => {
    const column = getColumnResult(result?.result);

    if (column && rowIndex != null) {
      const type = column.type.cellType;
      const value = column.value.at(rowIndex);

      return (type && value && { type, value }) || undefined;
    }
    return undefined;
  }, columnBlockId);
}

export function useTableColumnFormulaResultForColumn(
  colIndex?: number
): Result.Result<'column'> | undefined {
  const computer = useComputer();
  const blockId = useColumnBlockId(colIndex);

  return getColumnResult(computer.getBlockIdResult$.use(blockId)?.result);
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

const getColumnResult = (result: Result.Result | undefined) => {
  if (result?.type.kind === 'column') {
    return result as Result.Result<'column'>;
  }
  return undefined;
};

const useColumnBlockId = (colIndex?: number) => {
  const { cellTypes, columnBlockIds } = useEditorTableContext();

  return colIndex != null && cellTypes[colIndex]?.kind === 'table-formula'
    ? columnBlockIds.at(colIndex)
    : undefined;
};
