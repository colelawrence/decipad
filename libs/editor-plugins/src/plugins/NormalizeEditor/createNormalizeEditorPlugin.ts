/* eslint-disable no-param-reassign */
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  H1Element,
  MyEditor,
  MyNodeEntry,
  ParagraphElement,
  topLevelBlockKinds as allowedTopLevelBlockTypes,
} from '@decipad/editor-types';
import { insertNodes } from '@decipad/editor-utils';
import {
  getNodeChildren,
  isEditor,
  isElement,
  isText,
  unwrapNodes,
  wrapNodes,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../pluginFactories';

const normalizeEditor =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;
    if (isEditor(node)) {
      // Enforce leading H1 even if there are no elements
      if (!node.children.length) {
        return () =>
          insertNodes(
            editor,
            {
              id: nanoid(),
              type: ELEMENT_H1,
              children: [],
            } as unknown as H1Element,
            {
              at: [...path, 0],
            }
          );
      }
      for (const blockEntry of getNodeChildren(editor, path)) {
        const [blockNode, blockPath] = blockEntry;

        if (blockPath[0] === 0) {
          // Enforce leading H1
          if (isText(blockNode)) {
            return () =>
              wrapNodes(
                editor,
                {
                  id: nanoid(),
                  type: ELEMENT_H1,
                  children: [],
                } as unknown as H1Element,
                {
                  at: blockPath,
                }
              );
          }
          if (isElement(blockNode) && blockNode.type !== ELEMENT_H1) {
            return () => unwrapNodes(editor, { at: blockPath });
          }
        } else if (isElement(blockNode) && blockNode.type === ELEMENT_H1) {
          // Forbid H1s elsewhere
          return () => unwrapNodes(editor, { at: blockPath });
        }

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
