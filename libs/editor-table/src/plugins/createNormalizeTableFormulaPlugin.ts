import type { Computer } from '@decipad/computer-interfaces';
import { type NormalizerReturnValue } from '@decipad/editor-plugins';
import type { TableHeaderElement } from '@decipad/editor-types';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
} from '@decipad/editor-types';
import { assertElementType, insertNodes } from '@decipad/editor-utils';
import type {
  Value,
  PlateEditor,
  ENodeEntry,
  EElement,
} from '@udecode/plate-common';
import { hasNode, deleteText } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
// We do this following import this way because tree-shaking is not good enough
import { createNormalizerPlugin } from '../../../editor-plugins/src/pluginFactories/normalizerPlugin';

export const normalizeTableFormula =
  <TV extends Value, TE extends PlateEditor<TV>>(_computer: Computer) =>
  (editor: TE) =>
  (entry: ENodeEntry<TV>): NormalizerReturnValue => {
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
              } as EElement<TV>,
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

export const createNormalizeTableFormulaPlugin = <
  TV extends Value,
  TE extends PlateEditor<TV>
>(
  computer: Computer
) =>
  createNormalizerPlugin<TV, TE>({
    name: 'NORMALIZE_TABLE_FORMULA_PLUGIN',
    elementType: ELEMENT_TABLE,
    plugin: normalizeTableFormula(computer),
  });
