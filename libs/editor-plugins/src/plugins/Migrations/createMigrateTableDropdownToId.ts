import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  MyEditor,
  MyNodeEntry,
  TableCellElement,
} from '@decipad/editor-types';
import { ELEMENT_TD, insertText, isElement } from '@udecode/plate';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../pluginFactories';
import { assertElementType } from '@decipad/editor-utils';

export const createMigrateTableDropdownToId = createNormalizerPluginFactory({
  name: 'MIGRATE_TABLE_DROPDOWN_TO_ID',
  elementType: ELEMENT_TH,
  plugin:
    (editor: MyEditor) =>
    (entry: MyNodeEntry): NormalizerReturnValue => {
      const [node, path] = entry;

      if (isElement(node) && node.type === ELEMENT_TH) {
        assertElementType(node, ELEMENT_TH);

        if (node.cellType.kind !== 'dropdown') return false;

        const columnIndex = path[2];

        const tableIndex = path[0];

        const table = editor.children[tableIndex];

        assertElementType(table, ELEMENT_TABLE);

        const indexesToChange: [number, string][] = [];

        for (let i = 2; i < table.children.length; i += 1) {
          const cell = table.children[i].children[
            columnIndex
          ] as TableCellElement;

          assertElementType(cell, ELEMENT_TD);

          const { text } = cell.children[0];

          if (text.includes('exprRef_')) {
            indexesToChange.push([i, text]);
          }
        }

        if (indexesToChange.length === 0) return false;

        return () => {
          for (const [i, text] of indexesToChange) {
            insertText(editor, text.slice('exprRef_'.length), {
              at: [tableIndex, i, columnIndex, 0],
            });
          }
        };
      }

      return false;
    },
});
