import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import {
  ELEMENT_TABLE,
  DEPRECATED_ELEMENT_TABLE_INPUT,
  MyEditor,
  MyNodeEntry,
  DeprecatedTableInputElement,
} from '@decipad/editor-types';
import { deleteText, isElement, TNodeEntry } from '@udecode/plate';
import { insertNodes } from '@decipad/editor-utils';
import { Computer } from '@decipad/computer';
import { tableFromLegacyTableInputElement } from '../utils/tableFromLegacyTableInputElement';
import { normalizeTable } from '../utils/normalizeTable';

const normalizeTableInput = (
  editor: MyEditor,
  entry: TNodeEntry<DeprecatedTableInputElement>
) => {
  const [element, path] = entry;
  const table = tableFromLegacyTableInputElement(element);
  deleteText(editor, { at: path });
  insertNodes(editor, table, { at: path });
};

export const createNormalizeTablesPlugin = (computer: Computer) =>
  createNormalizerPluginFactory({
    name: 'NORMALIZE_TABLES_PLUGIN',
    plugin:
      (editor: MyEditor) =>
      (entry: MyNodeEntry): boolean => {
        const [node, path] = entry;
        if (
          !isElement(node) ||
          (node.type !== DEPRECATED_ELEMENT_TABLE_INPUT &&
            node.type !== ELEMENT_TABLE)
        ) {
          return false;
        }
        if (node.type === DEPRECATED_ELEMENT_TABLE_INPUT) {
          normalizeTableInput(editor, [node, path]);
          return true;
        }
        if (node.type === ELEMENT_TABLE) {
          return normalizeTable(editor, computer, [node, path]);
        }

        return false;
      },
  })();
