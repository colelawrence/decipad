import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
  TableColumnFormulaElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { enumerate } from '@decipad/utils';
import { hasNode, insertNodes, deleteText } from '@udecode/plate';

export const createNormalizeTableFormulaPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_TABLE_FORMULA_PLUGIN',
  elementType: ELEMENT_TABLE,
  plugin: (editor) => (entry) => {
    const [element, path] = entry;
    assertElementType(element, ELEMENT_TABLE);

    const [caption, firstRow] = element.children;
    const [, ...formulas] = caption?.children || [];
    const headersWithFormulas =
      firstRow?.children.filter(
        (th) => th.cellType?.kind === 'table-formula'
      ) || [];

    const columnIdToHeader = new Map<string, TableHeaderElement>();
    for (const header of headersWithFormulas) {
      columnIdToHeader.set(header.id, header);
    }

    // insert missing formulas

    for (const [index, header] of enumerate(headersWithFormulas)) {
      const captionChildIndex = caption.children.findIndex(
        (el) =>
          el.type === ELEMENT_TABLE_COLUMN_FORMULA && el.columnId === header.id
      );
      if (captionChildIndex < 0) {
        insertNodes(
          editor,
          {
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            columnId: header.id,
            children: [{ text: '' }],
          } as TableColumnFormulaElement,
          { at: [...path, 0, index + 1] }
        );
        return true;
      }
    }

    // delete formulas that don't have a column
    for (const formula of formulas) {
      if (!columnIdToHeader.has(formula.columnId)) {
        const formulaPath = [...path, 0, caption.children.indexOf(formula)];
        if (hasNode(editor, formulaPath)) {
          deleteText(editor, {
            at: formulaPath,
          });
          return true;
        }
      }
    }

    // TODO: sort formulas like the columns

    return false;
  },
});
