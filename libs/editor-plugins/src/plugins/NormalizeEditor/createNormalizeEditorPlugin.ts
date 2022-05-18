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
import {
  getNodeChildren,
  insertNodes,
  isEditor,
  isElement,
  isText,
  unwrapNodes,
  wrapNodes,
} from '@udecode/plate';
import { createNormalizerPluginFactory } from '../../pluginFactories';

const normalizeEditor = (editor: MyEditor) => (entry: MyNodeEntry) => {
  const [node, path] = entry;

  if (isEditor(node)) {
    // Enforce leading H1 even if there are no elements
    if (!node.children.length) {
      insertNodes(
        editor,
        { type: ELEMENT_H1, children: [] } as unknown as H1Element,
        {
          at: [...path, 0],
        }
      );
      return true;
    }
    for (const blockEntry of getNodeChildren(editor, path)) {
      const [blockNode, blockPath] = blockEntry;

      if (blockPath[0] === 0) {
        // Enforce leading H1
        if (isText(blockNode)) {
          wrapNodes(
            editor,
            { type: ELEMENT_H1, children: [] } as unknown as H1Element,
            {
              at: blockPath,
            }
          );
          return true;
        }
        if (isElement(blockNode) && blockNode.type !== ELEMENT_H1) {
          unwrapNodes(editor, { at: blockPath });
          return true;
        }
      } else if (isElement(blockNode) && blockNode.type === ELEMENT_H1) {
        // Forbid H1s elsewhere
        unwrapNodes(editor, { at: blockPath });
        return true;
      }

      // Enforce the top-level block allowed elements
      if (isText(blockNode)) {
        wrapNodes(
          editor,
          {
            type: ELEMENT_PARAGRAPH,
            children: [],
          } as unknown as ParagraphElement,
          {
            at: blockPath,
          }
        );
        return true;
      }
      if (
        isElement(blockNode) &&
        !allowedTopLevelBlockTypes.includes(blockNode.type)
      ) {
        unwrapNodes(editor, { at: blockPath });
        return true;
      }
    }
  }
  return false;
};

export const createNormalizeEditorPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_EDITOR_PLUGIN',
  plugin: normalizeEditor,
});
