import type {
  EElementOrText,
  ENodeEntry,
  PlateEditor,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import type { Computer } from '@decipad/computer-interfaces';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import type {
  DeprecatedTableInputElement,
  TableElement,
} from '@decipad/editor-types';
import {
  ELEMENT_TABLE,
  DEPRECATED_ELEMENT_TABLE_INPUT,
} from '@decipad/editor-types';
import { deleteText, isElement } from '@udecode/plate-common';
import { insertNodes } from '@decipad/editor-utils';
import { createNormalizerPluginFactory } from '@decipad/editor-plugin-factories';
import { tableFromLegacyTableInputElement } from '../utils/tableFromLegacyTableInputElement';
import { normalizeTable } from '../utils/normalizeTable';

const normalizeTableInput = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
  entry: TNodeEntry<DeprecatedTableInputElement>
) => {
  const [element, path] = entry;
  const table = tableFromLegacyTableInputElement(element) as EElementOrText<TV>;
  return () => {
    deleteText(editor, { at: path });
    insertNodes(editor, [table], { at: path });
  };
};

export const createNormalizeTablesPlugin = <
  TV extends Value,
  TE extends PlateEditor<TV>
>(
  computer: Computer
) =>
  createNormalizerPluginFactory<TV, TE>({
    name: 'NORMALIZE_TABLES_PLUGIN',
    plugin:
      (editor: TE) =>
      (entry: ENodeEntry<TV>): NormalizerReturnValue => {
        const [node, path] = entry;
        if (
          !isElement(node) ||
          (node.type !== DEPRECATED_ELEMENT_TABLE_INPUT &&
            node.type !== ELEMENT_TABLE)
        ) {
          return false;
        }
        if (node.type === DEPRECATED_ELEMENT_TABLE_INPUT) {
          return normalizeTableInput<TV, TE>(editor, [
            node as DeprecatedTableInputElement,
            path,
          ]);
        }
        if (node.type === ELEMENT_TABLE) {
          return normalizeTable<TV, TE>(editor, computer, [
            node as TableElement,
            path,
          ]);
        }

        return false;
      },
  })();
