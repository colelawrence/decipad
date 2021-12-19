/* eslint-disable no-param-reassign */
// TODO fix node types
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ELEMENT_CODE_BLOCK,
  getPlatePluginWithOverrides,
  WithOverride,
} from '@udecode/plate';
import { Element, Node, Transforms } from 'slate';

type TypedNode = Node & {
  type: string;
};

export const WithAutoFormatCode = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // If the element is a code block, ensure its children are valid.
    if (
      Element.isElement(node) &&
      (node as TypedNode).type === ELEMENT_CODE_BLOCK
    ) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (
          Element.isElement(child) &&
          (child as TypedNode).type === ELEMENT_CODE_BLOCK
        ) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};

export const createAutoFormatCodePlugin =
  getPlatePluginWithOverrides(WithAutoFormatCode);
