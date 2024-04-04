/* eslint-disable no-param-reassign */
import type {
  MyEditor,
  MyNodeEntry,
  ParagraphElement,
} from '@decipad/editor-types';
import {
  ELEMENT_PARAGRAPH,
  topLevelBlockKinds as allowedTopLevelBlockTypes,
} from '@decipad/editor-types';
import {
  getNodeChildren,
  isEditor,
  isElement,
  isText,
  unwrapNodes,
  wrapNodes,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import type { NormalizerReturnValue } from '../../pluginFactories';
import { createNormalizerPluginFactory } from '../../pluginFactories';

const normalizeEditor =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;
    if (isEditor(node)) {
      for (const blockEntry of getNodeChildren(editor, path)) {
        const [blockNode, blockPath] = blockEntry;

        // Enforce the top-level block allowed elements
        if (isText(blockNode)) {
          return () =>
            wrapNodes(
              editor,
              {
                id: nanoid(),
                type: ELEMENT_PARAGRAPH,
                children: [],
              } as unknown as ParagraphElement,
              {
                at: blockPath,
              }
            );
        }
        if (
          isElement(blockNode) &&
          !allowedTopLevelBlockTypes.includes(blockNode.type)
        ) {
          return () => unwrapNodes(editor, { at: blockPath });
        }
      }
    }
    return false;
  };

export const createNormalizeEditorPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_EDITOR_PLUGIN',
  plugin: normalizeEditor,
});
