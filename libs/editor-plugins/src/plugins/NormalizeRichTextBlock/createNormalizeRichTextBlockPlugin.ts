/* eslint-disable no-param-reassign */
import {
  ELEMENT_INLINE_NUMBER,
  ELEMENT_LINK,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { RICH_TEXT_BLOCK_TYPES } from '@decipad/editor-utils';
import { getNodeChildren, isElement, unwrapNodes } from '@udecode/plate';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../pluginFactories';

const ALLOWED_CHILD_TYPES = new Set([ELEMENT_LINK, ELEMENT_INLINE_NUMBER]);

const normalizeRichTextBlock =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;

    if (isElement(node) && new Set(RICH_TEXT_BLOCK_TYPES).has(node.type)) {
      for (const childEntry of getNodeChildren(editor, path)) {
        const [childNode, childPath] = childEntry;
        if (isElement(childNode) && !ALLOWED_CHILD_TYPES.has(childNode.type)) {
          return () => unwrapNodes(editor, { at: childPath });
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
