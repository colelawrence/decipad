import {
  getNodeString,
  hasNode,
  insertNodes,
  insertText,
  isElement,
  TNodeEntry,
} from '@udecode/plate';
import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
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
} from '@decipad/editor-types';
import { enumerate } from '@decipad/utils';
import { nanoid } from 'nanoid';

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

export const normalizeTableFormulas =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): boolean => {
    const [node, path] = entry;
    if (!isElement(node) || node.type !== ELEMENT_TABLE) {
      return false;
    }
    if (node.type === ELEMENT_TABLE) {
      return normalizeFormulaColumns(editor, [node, path]);
    }
    return false;
  };

export const createNormalizeTableFormulaCellsPlugin =
  createNormalizerPluginFactory({
    name: 'NORMALIZE_TABLE_FORMULA_CELLS_PLUGIN',
    plugin: normalizeTableFormulas,
  });
