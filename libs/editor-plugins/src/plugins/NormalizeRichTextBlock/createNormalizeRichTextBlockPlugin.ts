/* eslint-disable no-param-reassign */
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { isElement, TNode } from '@udecode/plate';
import { Editor, Node, NodeEntry, Transforms } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const RICH_TEXT_BLOCK_TYPES = [
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LIC,
  ELEMENT_CALLOUT,
];
const ALLOWED_CHILD_TYPES = [ELEMENT_LINK];

const normalizeRichTextBlock = (editor: Editor) => (entry: NodeEntry) => {
  const [node, path] = entry as NodeEntry<TNode>;

  if (RICH_TEXT_BLOCK_TYPES.includes(node.type)) {
    if (normalizeExcessProperties(editor, entry)) {
      return true;
    }

    for (const childEntry of Node.children(editor, path)) {
      const [childNode, childPath] = childEntry as NodeEntry<TNode>;

      if (
        isElement(childNode) &&
        !ALLOWED_CHILD_TYPES.includes(childNode.type)
      ) {
        Transforms.unwrapNodes(editor, { at: childPath });
        return true;
      }
    }
  }

  return false;
};

export const createNormalizeRichTextBlockPlugin = createNormalizerPluginFactory(
  {
    name: 'NORMALIZE_RICH_TEXT_BLOCK_PLUGIN',
    plugin: normalizeRichTextBlock,
  }
);
