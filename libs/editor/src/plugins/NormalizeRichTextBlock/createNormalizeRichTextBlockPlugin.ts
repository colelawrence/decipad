/* eslint-disable no-param-reassign */
import {
  WithOverride,
  TNode,
  getPlatePluginWithOverrides,
  isElement,
} from '@udecode/plate';
import { Node, NodeEntry, Transforms } from 'slate';
import {
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LIC,
} from '../../elements';
import { normalizeExcessProperties } from '../../utils/normalize';

const RICH_TEXT_BLOCK_TYPES = [
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LIC,
];
const ALLOWED_CHILD_TYPES = [ELEMENT_LINK];

const withNormalizeRichTextBlock = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (RICH_TEXT_BLOCK_TYPES.includes(node.type)) {
      if (normalizeExcessProperties(editor, entry)) {
        return;
      }

      for (const childEntry of Node.children(editor, path)) {
        const [childNode, childPath] = childEntry as NodeEntry<TNode>;

        if (
          isElement(childNode) &&
          !ALLOWED_CHILD_TYPES.includes(childNode.type)
        ) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

export const createNormalizeRichTextBlockPlugin = getPlatePluginWithOverrides(
  withNormalizeRichTextBlock
);
