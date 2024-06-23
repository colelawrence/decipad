import { type NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import type {
  IntegrationTypes,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { ELEMENT_INTEGRATION } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';

// Weird import because Jest will complain
import { createNormalizerPlugin } from '@decipad/editor-plugin-factories';
import {
  insertNodes,
  isText,
  removeNodes,
  setNodes,
  unwrapNodes,
} from '@udecode/plate-common';
import { Path } from 'slate';

const defaultIntegrationValues: Omit<
  IntegrationTypes.IntegrationBlock,
  'children' | 'type' | 'id' | 'integrationType'
> = {
  typeMappings: [],
  columnsToHide: [],
  isFirstRowHeader: false,
};

function normalizeName(
  editor: MyEditor,
  element: IntegrationTypes.IntegrationBlock,
  path: Path
): NormalizerReturnValue {
  if (element.children.length === (0 as any)) {
    return () => insertNodes(editor, { text: 'Variable' }, { at: path });
  }

  if (element.children.length === 1 && !isText(element.children[0])) {
    return () => unwrapNodes(editor, { at: [...path, 0] });
  }

  if (element.children.length > 1) {
    return () => removeNodes(editor, { at: [...path, 1] });
  }

  return false;
}

function normalizeProperties(
  editor: MyEditor,
  element: IntegrationTypes.IntegrationBlock,
  path: Path
): NormalizerReturnValue {
  for (const [key, defaultValue] of Object.entries(defaultIntegrationValues)) {
    if (key in element) {
      continue;
    }

    return () =>
      setNodes(
        editor,
        {
          [key]: defaultValue,
        } satisfies Partial<IntegrationTypes.IntegrationBlock>,
        { at: path }
      );
  }

  return false;
}

export const createNormalizeIntegrationBlock = createNormalizerPlugin({
  name: 'NORMALIZE_INTEGRATION_BLOCK_PLUGIN',
  elementType: ELEMENT_INTEGRATION,
  plugin:
    (editor: MyEditor) =>
    (entry: MyNodeEntry): NormalizerReturnValue => {
      const [element, path] = entry;
      assertElementType(element, ELEMENT_INTEGRATION);

      const hasNormalizedName = normalizeName(editor, element, path);
      if (typeof hasNormalizedName === 'function') {
        return hasNormalizedName;
      }

      const hasNormalizedProperties = normalizeProperties(
        editor,
        element,
        path
      );
      if (typeof hasNormalizedProperties === 'function') {
        return hasNormalizedProperties;
      }

      return false;
    },
});
