/* eslint-disable no-param-reassign */
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_COLUMNS,
  ELEMENT_FETCH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_PLOT,
  ELEMENT_TABLE_INPUT,
  ELEMENT_UL,
} from '@decipad/editor-types';
import {
  getPlatePluginWithOverrides,
  insertNodes,
  isElement,
  isText,
  TDescendant,
  TNode,
  WithOverride,
  wrapNodes,
} from '@udecode/plate';
import { Node, NodeEntry, Transforms } from 'slate';

const allowedTopLevelBlockTypes = [
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_COLUMNS,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_TABLE_INPUT,
  ELEMENT_FETCH,
  ELEMENT_PLOT,
];

const withNormalizeEditor = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (!path.length) {
      // Enforce leading H1 even if there are no elements
      if (!node.children.length) {
        insertNodes(
          editor,
          { type: ELEMENT_H1, children: [] },
          { at: [...path, 0] }
        );
        return;
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
            return;
          }
          if (isElement(blockNode) && blockNode.type !== ELEMENT_H1) {
            Transforms.unwrapNodes(editor, { at: blockPath });
            return;
          }
        } else if (isElement(blockNode) && blockNode.type === ELEMENT_H1) {
          // Forbid H1s elsewhere
          Transforms.unwrapNodes(editor, { at: blockPath });
          return;
        }

        // Enforce the top-level block allowed elements
        if (isText(blockNode)) {
          wrapNodes(
            editor,
            { type: ELEMENT_PARAGRAPH, children: [] },
            { at: blockPath }
          );
          return;
        }
        if (
          isElement(blockNode) &&
          !allowedTopLevelBlockTypes.includes(blockNode.type)
        ) {
          Transforms.unwrapNodes(editor, { at: blockPath });
          return;
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

export const createNormalizeEditorPlugin =
  getPlatePluginWithOverrides(withNormalizeEditor);
