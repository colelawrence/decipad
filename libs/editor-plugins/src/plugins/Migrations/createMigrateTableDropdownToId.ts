import type {
  MyEditor,
  MyNodeEntry,
  TableCellElement,
} from '@decipad/editor-types';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH } from '@decipad/editor-types';
import {
  getNodeString,
  isElement,
  replaceNodeChildren,
} from '@udecode/plate-common';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import { createNormalizerPluginFactory } from '@decipad/editor-plugin-factories';
import { assertElementType } from '@decipad/editor-utils';
import type { Path } from 'slate';

export const createMigrateTableDropdownToId = createNormalizerPluginFactory({
  name: 'MIGRATE_TABLE_DROPDOWN_TO_ID',
  elementType: ELEMENT_TH,
  plugin:
    (editor: MyEditor) =>
    (entry: MyNodeEntry): NormalizerReturnValue => {
      const [node, path] = entry;

      if (isElement(node) && node.type === ELEMENT_TH) {
        if (!node.cellType) return false;

        assertElementType(node, ELEMENT_TH);

        if (node.cellType.kind !== 'dropdown') return false;

        const columnIndex = path[2];

        const tableIndex = path[0];

        const table = editor.children[tableIndex];

        assertElementType(table, ELEMENT_TABLE);

        const cellsToChange: { cellPath: Path; replacedText: string }[] = [];

        for (
          let rowIndex = 2;
          rowIndex < table.children.length;
          rowIndex += 1
        ) {
          const cell = table.children[rowIndex].children[
            columnIndex
          ] as TableCellElement;

          assertElementType(cell, ELEMENT_TD);

          const text = getNodeString(cell);

          if (text.includes('exprRef_')) {
            const replacedText = text.replace(/exprRef_/g, '');
            const cellPath = [tableIndex, rowIndex, columnIndex];
            cellsToChange.push({ cellPath, replacedText });
          }
        }

        if (cellsToChange.length > 0) {
          return () => {
            for (const { cellPath, replacedText } of cellsToChange) {
              // Duplicate of setCellText
              replaceNodeChildren(editor, {
                at: cellPath,
                nodes: { text: replacedText },
                removeOptions: {
                  voids: true,
                },
              });
            }
          };
        }
      }

      return false;
    },
});
