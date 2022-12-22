import { Computer } from '@decipad/computer';
import { createNormalizerPlugin } from '@decipad/editor-plugins';
import {
  ELEMENT_SMART_REF,
  ELEMENT_TABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyEditor,
  MyNodeEntry,
  TableHeaderElement,
} from '@decipad/editor-types';
import {
  assertElementType,
  insertNodes,
  normalizeSmartRefs,
} from '@decipad/editor-utils';
import {
  hasNode,
  deleteText,
  getNodeChildren,
  isElement,
} from '@udecode/plate';
import { nanoid } from 'nanoid';

export const normalizeTableFormula =
  (computer: Computer) =>
  (editor: MyEditor) =>
  (entry: MyNodeEntry): boolean => {
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
        insertNodes(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_TABLE_COLUMN_FORMULA,
            columnId: header.id,
            children: [{ text: '' }],
          },
          { at: insertPath }
        );
        return true;
      }
    }

    // delete formulas that don't have a column
    for (const formula of formulas) {
      const formulaPath = [...path, 0, caption.children.indexOf(formula)];
      if (!columnIdToHeader.has(formula.columnId)) {
        if (hasNode(editor, formulaPath)) {
          deleteText(editor, {
            at: formulaPath,
          });
          return true;
        }
      }
      for (const lineChild of getNodeChildren(editor, formulaPath)) {
        const [lineChildNode, lineChildPath] = lineChild;
        if (
          !isElement(lineChildNode) ||
          lineChildNode.type === ELEMENT_SMART_REF
        ) {
          if (
            normalizeSmartRefs(lineChildNode, lineChildPath, editor, computer)
          ) {
            return true;
          }
        }
      }
    }

    // TODO: sort formulas like the columns

    return false;
  };

export const createNormalizeTableFormulaPlugin = (computer: Computer) =>
  createNormalizerPlugin({
    name: 'NORMALIZE_TABLE_FORMULA_PLUGIN',
    elementType: ELEMENT_TABLE,
    plugin: normalizeTableFormula(computer),
  });
