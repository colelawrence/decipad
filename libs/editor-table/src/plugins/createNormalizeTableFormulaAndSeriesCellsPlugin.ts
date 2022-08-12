import {
  getChildren,
  getNodeString,
  hasNode,
  insertNodes,
  insertText,
  isElement,
  setSelection,
  TNodeEntry,
} from '@udecode/plate';
import { createNormalizerPlugin } from '@decipad/editor-plugins';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  MyNodeEntry,
  TableCellElement,
  TableElement,
  TableHeaderElement,
  TableHeaderRowElement,
  TableRowElement,
} from '@decipad/editor-types';
import { enumerate, getDefined } from '@decipad/utils';
import { parseSeriesStart, seriesIterator } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';
import { NodeEntry } from 'slate';
import { Computer } from '@decipad/computer';
import { dequal } from 'dequal';

const tableIsSquare = ({
  children: [, headerRow, ...dataRows],
}: TableElement) =>
  headerRow?.children?.length > 0 &&
  dataRows.every((tr) => tr.children?.length === headerRow.children?.length);

const getBlankCell = (isHeader: boolean) => {
  const id = nanoid();
  const children = [{ text: '' }];

  return isHeader
    ? ({
        id,
        type: ELEMENT_TH,
        children,
        cellType: { kind: 'string' },
      } as TableHeaderElement)
    : ({ id, type: ELEMENT_TD, children } as TableCellElement);
};

const normalizeFormulaColumns = (
  editor: MyEditor,
  [table, tablePath]: TNodeEntry<TableElement>
) => {
  const [, headerRow] = table.children;
  if (!tableIsSquare(table)) return false;

  const formulaColIndices = headerRow.children.flatMap((th, index) => {
    if (th.cellType?.kind === 'table-formula') {
      return [index];
    }
    return [];
  });

  if (formulaColIndices.length === 0) {
    return false;
  }

  // Prevent formula columns from being the first column
  if (formulaColIndices[0] === 0) {
    let didTransform = false;
    for (const [rowIndex, row] of enumerate(table.children)) {
      if (row.type !== ELEMENT_TR) {
        continue;
      }

      const newCellPath = [...tablePath, rowIndex, 0];

      if (hasNode(editor, newCellPath)) {
        const newCell = getBlankCell(row.children[0].type === ELEMENT_TH);

        insertNodes(editor, [newCell], { at: newCellPath });
        didTransform = true;
      }
    }

    if (didTransform) return true;
  }

  // Empty formula cells. They must have no text (results come from off-document)
  for (const [rowIndex, row] of enumerate(table.children)) {
    if (row.type !== ELEMENT_TR) {
      // Skip caption
      continue;
    }

    for (const cellIndex of formulaColIndices) {
      const cell = row.children[cellIndex];

      if (cell.type === ELEMENT_TD && getNodeString(cell) !== '') {
        const tdPath = [...tablePath, rowIndex, cellIndex];

        insertText(editor, '', { at: tdPath });
        return true;
      }
    }
  }

  return false;
};

const normalizeSeriesColumn = (
  computer: Computer,
  editor: MyEditor,
  tableEntry: TNodeEntry<TableElement>,
  [th]: NodeEntry<TableHeaderElement>,
  columnIndex: number
): boolean => {
  if (th.cellType.kind !== 'series') {
    return false;
  }

  const rows = getChildren(tableEntry).slice(2) as NodeEntry<TableRowElement>[];
  const [firstRow, ...restRows] = rows;
  const firstCell = getChildren(firstRow)[columnIndex];
  if (!firstCell) {
    return false;
  }
  const firstCellContent = getNodeString(firstCell[0]).trim();
  if (!firstCellContent) {
    return false;
  }
  const { type, granularity, error } = parseSeriesStart(
    th.cellType.seriesType,
    firstCellContent
  );
  const cellId = firstCell[0].id;
  if (error) {
    computer.setParseError(cellId, { elementId: cellId, error });
    return false;
  }
  // no parse error
  if (computer.hasParseError(cellId)) {
    computer.unsetParseError(cellId);
  }

  // now we need to ensure all the remaining cells have the expected from the next in the series
  const series = seriesIterator(
    type,
    getDefined(granularity),
    firstCellContent
  );
  for (const row of restRows) {
    const cell = getChildren(row)[columnIndex];
    if (cell) {
      const [cellEl, cellPath] = cell;
      const existingText = getNodeString(cellEl).trim();
      const expectedText = series.next().value;
      if (existingText !== expectedText) {
        const selectionBefore = editor.selection;
        insertText(editor, expectedText, { at: cellPath });
        if (selectionBefore && !dequal(selectionBefore, editor.selection)) {
          setSelection(editor, selectionBefore);
        }
        return true;
      }
    }
  }
  return false;
};

const normalizeSeriesColumns = (
  computer: Computer,
  editor: MyEditor,
  tableEntry: TNodeEntry<TableElement>
) => {
  const [, _ths] = getChildren(tableEntry); // second element of a table is a header table row
  const ths = _ths as NodeEntry<TableHeaderRowElement>;
  for (const [index, th] of enumerate(getChildren(ths))) {
    if (normalizeSeriesColumn(computer, editor, tableEntry, th, index)) {
      return true;
    }
  }
  return false;
};

export const normalizeTableFormulaAndSeries =
  (computer: Computer) =>
  (editor: MyEditor) =>
  (entry: MyNodeEntry): boolean => {
    const [node, path] = entry;
    if (!isElement(node) || node.type !== ELEMENT_TABLE) {
      return false;
    }
    if (node.type === ELEMENT_TABLE) {
      return (
        normalizeFormulaColumns(editor, [node, path]) ||
        normalizeSeriesColumns(computer, editor, [node, path])
      );
    }
    return false;
  };

export const createNormalizeTableFormulaAndSeriesCellsPlugin = (
  computer: Computer
) =>
  createNormalizerPlugin({
    name: 'NORMALIZE_TABLE_FORMULA_AND_SERIES_CELLS_PLUGIN',
    plugin: normalizeTableFormulaAndSeries(computer),
  });
