/* eslint-disable no-param-reassign */
import {
  getRenderElement,
  isElement,
  isText,
  PlatePlugin,
  TDescendant,
} from '@udecode/plate';
import { Node, NodeEntry, Transforms } from 'slate';
import { ELEMENT_COLUMNS, ELEMENT_INPUT } from '@decipad/editor-types';

export const createLayoutColumnsPlugin = (): PlatePlugin => ({
  renderElement: getRenderElement(ELEMENT_COLUMNS),
  withOverrides: (editor) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = (entry) => {
      const [node, path] = entry;
      if (isElement(node) && node.type === ELEMENT_COLUMNS) {
        for (const childEntry of Node.children(editor, path)) {
          const [childNode, childPath] = childEntry as NodeEntry<TDescendant>;

          if (
            isText(childNode) ||
            (isElement(childNode) && childNode.type !== ELEMENT_INPUT)
          ) {
            Transforms.liftNodes(editor, { at: childPath });
            return;
          }
        }

        if (node.children.length === 0) {
          Transforms.removeNodes(editor, { at: path });
        }
        if (node.children.length === 1) {
          Transforms.unwrapNodes(editor, { at: path });
        }
        return;
      }

      return normalizeNode(entry);
    };

    return editor;
  },
});
