/* eslint-disable no-param-reassign */
import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  topLevelBlockKinds as allowedTopLevelBlockTypes,
} from '@decipad/editor-types';
import {
  insertNodes,
  isElement,
  isText,
  TDescendant,
  TNode,
  wrapNodes,
} from '@udecode/plate';
import { Editor, Node, NodeEntry, Transforms } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';

const normalizeEditor = (editor: Editor) => (entry: NodeEntry) => {
  const [node, path] = entry as NodeEntry<TNode>;

  if (!path.length) {
    // Enforce leading H1 even if there are no elements
    if (!node.children.length) {
      insertNodes(
        editor,
        { type: ELEMENT_H1, children: [] },
        { at: [...path, 0] }
      );
      return true;
    }
    for (const blockEntry of Node.children(editor, path)) {
      const [blockNode, blockPath] = blockEntry as NodeEntry<TDescendant>;

      if (blockPath[0] === 0) {
        // Enforce leading H1
        if (isText(blockNode)) {
          wrapNodes(
            editor,
            { type: ELEMENT_H1, children: [] },
            { at: blockPath }
          );
          return true;
        }
        if (isElement(blockNode) && blockNode.type !== ELEMENT_H1) {
          Transforms.unwrapNodes(editor, { at: blockPath });
          return true;
        }
      } else if (isElement(blockNode) && blockNode.type === ELEMENT_H1) {
        // Forbid H1s elsewhere
        Transforms.unwrapNodes(editor, { at: blockPath });
        return true;
      }

      // Enforce the top-level block allowed elements
      if (isText(blockNode)) {
        wrapNodes(
          editor,
          { type: ELEMENT_PARAGRAPH, children: [] },
          { at: blockPath }
        );
        return true;
      }
      if (
        isElement(blockNode) &&
        !allowedTopLevelBlockTypes.includes(blockNode.type)
      ) {
        Transforms.unwrapNodes(editor, { at: blockPath });
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
