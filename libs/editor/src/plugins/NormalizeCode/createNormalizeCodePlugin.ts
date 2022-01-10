/* eslint-disable no-param-reassign */
import {
  ELEMENT_CODE_BLOCK,
  getPlatePluginWithOverrides,
  WithOverride,
  TNode,
  wrapNodes,
  ELEMENT_CODE_LINE,
} from '@udecode/plate';
import { Element, Node, NodeEntry, Text, Transforms } from 'slate';

const WithNormalizeCode = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    // Code block
    if (Element.isElement(node) && node.type === ELEMENT_CODE_BLOCK) {
      for (const child of Node.children(editor, path)) {
        const [childNode, childPath] = child as NodeEntry<TNode>;

        // Text must be wrapped in a code line
        if (Text.isText(childNode)) {
          wrapNodes(
            editor,
            { type: ELEMENT_CODE_LINE, children: [] },
            { at: childPath }
          );
          return;
        }

        // Element children must be code lines
        if (
          Element.isElement(childNode) &&
          childNode.type !== ELEMENT_CODE_LINE
        ) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    // Code line
    if (Element.isElement(node) && node.type === ELEMENT_CODE_LINE) {
      for (const child of Node.children(editor, path)) {
        const [childNode, childPath] = child as NodeEntry<TNode>;

        // Children must be text
        if (Element.isElement(childNode)) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }

        // Text must be plain
        const props = Object.keys(Node.extractProps(childNode));
        if (props.length) {
          Transforms.unsetNodes(editor, props[0], { at: childPath });
          return;
        }
      }
    }

    normalizeNode(entry);
  };

  return editor;
};

export const createNormalizeCodePlugin =
  getPlatePluginWithOverrides(WithNormalizeCode);
