import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_INPUT,
  MyEditor,
  MyNodeEntry,
  TableInputElement,
} from '@decipad/editor-types';
import { deleteText, insertNodes, isElement, TNodeEntry } from '@udecode/plate';
import { tableFromLegacyTableInputElement } from '../utils/tableFromLegacyTableInputElement';
import { normalizeTable } from '../utils/normalizeTable';

const normalizeTableInput = (
  editor: MyEditor,
  entry: TNodeEntry<TableInputElement>
) => {
  const [element, path] = entry;
  const table = tableFromLegacyTableInputElement(element);
  deleteText(editor, { at: path });
  insertNodes(editor, table, { at: path });
};

export const normalizeTables =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): boolean => {
    const [node, path] = entry;
    if (
      !isElement(node) ||
      (node.type !== ELEMENT_TABLE_INPUT && node.type !== ELEMENT_TABLE)
    ) {
      return false;
    }
    if (node.type === ELEMENT_TABLE_INPUT) {
      normalizeTableInput(editor, [node, path]);
      return true;
    }
    if (node.type === ELEMENT_TABLE) {
      return normalizeTable(editor, [node, path]);
    }
    return false;
  };

export const createNormalizeTablesPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_TABLES_PLUGIN',
  plugin: normalizeTables,
});
