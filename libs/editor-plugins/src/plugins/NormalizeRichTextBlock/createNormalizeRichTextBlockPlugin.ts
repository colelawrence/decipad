/* eslint-disable no-param-reassign */
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  MyEditor,
  MyElement,
  MyNodeEntry,
} from '@decipad/editor-types';
import { getNodeChildren, isElement, unwrapNodes } from '@udecode/plate';
import { createNormalizerPluginFactory } from '../../pluginFactories';

const RICH_TEXT_BLOCK_TYPES = [
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LIC,
  ELEMENT_CALLOUT,
];
const ALLOWED_CHILD_TYPES = [ELEMENT_LINK];

const normalizeRichTextBlock = (editor: MyEditor) => (entry: MyNodeEntry) => {
  const [node, path] = entry;

  if (isElement(node) && RICH_TEXT_BLOCK_TYPES.includes(node.type)) {
    for (const childEntry of getNodeChildren(editor, path)) {
      const [childNode, childPath] = childEntry;

      if (
        isElement(childNode) &&
        !ALLOWED_CHILD_TYPES.includes(childNode.type)
      ) {
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
    elementType: RICH_TEXT_BLOCK_TYPES as unknown as MyElement['type'],
    acceptableElementProperties: ['icon', 'color'],
  }
);
