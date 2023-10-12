import type { RemoteComputer } from '@decipad/remote-computer';
import {
  NormalizerReturnValue,
  createNormalizerPlugin,
} from '@decipad/editor-plugins';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyEditor,
  MyNodeEntry,
  TableHeaderElement,
} from '@decipad/editor-types';
import { assertElementType, insertNodes } from '@decipad/editor-utils';
import { hasNode, deleteText } from '@udecode/plate';
import { nanoid } from 'nanoid';

export const normalizeTableFormula =
  (_computer: RemoteComputer) =>
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
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

    for (const header of headersWithFormulas) {
      const captionChildIndex = caption.children.findIndex(
        (el) =>
          el.type === ELEMENT_TABLE_COLUMN_FORMULA && el.columnId === header.id
      );
      if (captionChildIndex < 0) {
        const insertPath = [...path, 0, caption.children.length];
        return () =>
          insertNodes(
            editor,
            [
              {
                id: nanoid(),
                type: ELEMENT_TABLE_COLUMN_FORMULA,
                columnId: header.id,
                children: [{ text: '' }],
              },
            ],
            { at: insertPath }
          );
      }
    }

    // delete formulas that don't have a column
    for (const formula of formulas) {
      const formulaPath = [...path, 0, caption.children.indexOf(formula)];
      if (!columnIdToHeader.has(formula.columnId)) {
        if (hasNode(editor, formulaPath)) {
          return () =>
            deleteText(editor, {
              at: formulaPath,
            });
        }
      }
    }

    // TODO: sort formulas like the columns

    return false;
  };

export const createNormalizeTableFormulaPlugin = (computer: RemoteComputer) =>
  createNormalizerPlugin({
    name: 'NORMALIZE_TABLE_FORMULA_PLUGIN',
    elementType: ELEMENT_TABLE,
    plugin: normalizeTableFormula(computer),
  });
