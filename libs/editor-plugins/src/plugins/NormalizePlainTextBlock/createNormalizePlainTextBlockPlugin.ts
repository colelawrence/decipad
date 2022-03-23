/* eslint-disable no-param-reassign */
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@decipad/editor-types';
import { isElement, isText, TNode } from '@udecode/plate';
import { Editor, Node, NodeEntry, Transforms } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const PLAIN_TEXT_BLOCK_TYPES = [ELEMENT_H1, ELEMENT_H2, ELEMENT_H3];

const normalizePlainTextBlock = (editor: Editor) => (entry: NodeEntry) => {
  const [node, path] = entry as NodeEntry<TNode>;

  if (PLAIN_TEXT_BLOCK_TYPES.includes(node.type)) {
    if (normalizeExcessProperties(editor, entry)) {
      return true;
    }

    for (const childEntry of Node.children(editor, path)) {
      const [childNode, childPath] = childEntry as NodeEntry<TNode>;

      if (isElement(childNode)) {
        Transforms.unwrapNodes(editor, { at: childPath });
        return true;
      }

      if (isText(childNode)) {
        if (normalizeExcessProperties(editor, childEntry)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const createNormalizePlainTextBlockPlugin =
  createNormalizerPluginFactory({
    name: 'NORMALIZE_PLAIN_TEXT_BLOCK_PLUGIN',
    plugin: normalizePlainTextBlock,
  });
