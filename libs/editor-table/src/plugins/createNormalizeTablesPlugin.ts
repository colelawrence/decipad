import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_INPUT,
  TableElement,
  TableInputElement,
} from '@decipad/editor-types';
import { isElement } from '@udecode/plate';
import { Editor, NodeEntry, Transforms } from 'slate';
import { tableFromLegacyTableInputElement } from '../utils/tableFromLegacyTableInputElement';
import { normalizeTable } from '../utils/normalizeTable';

const normalizeTableInput = (
  editor: Editor,
  entry: NodeEntry<TableInputElement>
) => {
  const [element, path] = entry;
  const table = tableFromLegacyTableInputElement(element);
  Transforms.delete(editor, { at: path });
  Transforms.insertNodes(editor, table, { at: path });
};

export const normalizeTables =
  (editor: Editor) =>
  (entry: NodeEntry): boolean => {
    const [node] = entry;
    if (
      !isElement(node) ||
      (node.type !== ELEMENT_TABLE_INPUT && node.type !== ELEMENT_TABLE)
    ) {
      return false;
    }
    if (node.type === ELEMENT_TABLE_INPUT) {
      normalizeTableInput(editor, entry as NodeEntry<TableInputElement>);
      return true;
    }
    if (node.type === ELEMENT_TABLE) {
      return normalizeTable(editor, entry as NodeEntry<TableElement>);
    }
    return false;
  };

export const createNormalizeTablesPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_TABLES_PLUGIN',
  plugin: normalizeTables,
});
