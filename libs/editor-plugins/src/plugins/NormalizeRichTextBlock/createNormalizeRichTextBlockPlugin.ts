/* eslint-disable no-param-reassign */
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_INLINE_NUMBER,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { getNodeChildren, isElement, unwrapNodes } from '@udecode/plate';
import { createNormalizerPluginFactory } from '../../pluginFactories';

const RICH_TEXT_BLOCK_TYPES = new Set([
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LIC,
  ELEMENT_CALLOUT,
]);
const ALLOWED_CHILD_TYPES = new Set([ELEMENT_LINK, ELEMENT_INLINE_NUMBER]);

const normalizeRichTextBlock = (editor: MyEditor) => (entry: MyNodeEntry) => {
  const [node, path] = entry;

  if (isElement(node) && RICH_TEXT_BLOCK_TYPES.has(node.type)) {
    for (const childEntry of getNodeChildren(editor, path)) {
      const [childNode, childPath] = childEntry;
      if (isElement(childNode) && !ALLOWED_CHILD_TYPES.has(childNode.type)) {
        unwrapNodes(editor, { at: childPath });
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
