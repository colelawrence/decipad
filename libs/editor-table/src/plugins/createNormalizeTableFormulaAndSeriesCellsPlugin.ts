import {
  ENodeEntry,
  getChildren,
  getNodeString,
  isElement,
  PlateEditor,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import { type NormalizerReturnValue } from '@decipad/editor-plugins';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TR,
  TableElement,
  TableHeaderElement,
  TableHeaderRowElement,
  TableRowElement,
} from '@decipad/editor-types';
import { enumerate } from '@decipad/utils';
import { NodeEntry } from 'slate';
import { RemoteComputer } from '@decipad/remote-computer';
import { parseSeriesStart, seriesIterator } from '@decipad/parse';
import { setCellText } from '../utils/setCellText';
// We do this following import this way because tree-shaking is not good enough
import { createNormalizerPlugin } from '../../../editor-plugins/src/pluginFactories/normalizerPlugin';

const tableIsSquare = ({
  children: [, headerRow, ...dataRows],
}: TableElement) =>
  headerRow?.children?.length > 0 &&
  dataRows.every((tr) => tr.children?.length === headerRow.children?.length);

const normalizeFormulaColumns = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
  [table, tablePath]: TNodeEntry<TableElement>
): NormalizerReturnValue => {
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

  // Empty formula cells. They must have no text (results come from off-document)
  for (const [rowIndex, row] of enumerate(table.children)) {
    if (row.type !== ELEMENT_TR) {
      // Skip caption
      continue;
    }

    for (const cellIndex of formulaColIndices) {
      const cell = row.children[cellIndex];

      if (cell.type === ELEMENT_TD && getNodeString(cell).length > 0) {
        const tdPath = [...tablePath, rowIndex, cellIndex];

        return () => setCellText<TV>(editor, tdPath, '');
      }
    }
  }

  return false;
};

const normalizeSeriesColumn = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
  tableEntry: TNodeEntry<TableElement>,
  [th]: NodeEntry<TableHeaderElement>,
  columnIndex: number
): NormalizerReturnValue => {
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

  if (error) {
    // Error is in computer.
    return false;
  }

  // now we need to ensure all the remaining cells have the expected from the next in the series
  const series = seriesIterator(type, granularity, firstCellContent)[
    Symbol.iterator
  ]();
  for (const row of restRows) {
    const cell = getChildren(row)[columnIndex];
    if (cell) {
      const [cellEl, cellPath] = cell;
      const existingText = getNodeString(cellEl).trim();
      const expectedText = series.next().value;
      if (typeof expectedText === 'string' && existingText !== expectedText) {
        return () => setCellText<TV>(editor, cellPath, expectedText);
      }
    }
  }
  return false;
};

const normalizeSeriesColumns = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
  tableEntry: TNodeEntry<TableElement>
): NormalizerReturnValue => {
  const [, _ths] = getChildren(tableEntry); // second element of a table is a header table row
  const ths = _ths as NodeEntry<TableHeaderRowElement>;
  for (const [index, th] of enumerate(getChildren(ths))) {
    const normalize = normalizeSeriesColumn<TV, TE>(
      editor,
      tableEntry,
      th,
      index
    );
    if (normalize) {
      return normalize;
    }
  }
  return false;
};

export const normalizeTableFormulaAndSeries =
  <TV extends Value, TE extends PlateEditor<TV>>(editor: TE) =>
  (entry: ENodeEntry<TV>): NormalizerReturnValue => {
    const [node, path] = entry;
    if (!isElement(node) || node.type !== ELEMENT_TABLE) {
      return false;
    }
    if (node.type === ELEMENT_TABLE) {
      return (
        normalizeFormulaColumns<TV, TE>(editor, [node as TableElement, path]) ||
        normalizeSeriesColumns<TV, TE>(editor, [node as TableElement, path])
      );
    }
    return false;
  };

export const createNormalizeTableFormulaAndSeriesCellsPlugin = <
  TV extends Value,
  TE extends PlateEditor<TV>
>(
  _computer: RemoteComputer
) =>
  createNormalizerPlugin<TV, TE>({
    name: 'NORMALIZE_TABLE_FORMULA_AND_SERIES_CELLS_PLUGIN',
    plugin: normalizeTableFormulaAndSeries<TV, TE>,
  });
