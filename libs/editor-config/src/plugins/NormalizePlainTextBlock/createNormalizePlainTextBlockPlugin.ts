/* eslint-disable no-param-reassign */
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@decipad/editor-types';
import {
  getPlatePluginWithOverrides,
  isElement,
  isText,
  TNode,
  WithOverride,
} from '@udecode/plate';
import { Node, NodeEntry, Transforms } from 'slate';
import { normalizeExcessProperties } from '../../utils/normalize';

const PLAIN_TEXT_BLOCK_TYPES = [ELEMENT_H1, ELEMENT_H2, ELEMENT_H3];

const withNormalizePlainTextBlock = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (PLAIN_TEXT_BLOCK_TYPES.includes(node.type)) {
      if (normalizeExcessProperties(editor, entry)) {
        return;
      }

      for (const childEntry of Node.children(editor, path)) {
        const [childNode, childPath] = childEntry as NodeEntry<TNode>;

        if (isElement(childNode)) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }

        if (isText(childNode)) {
          if (normalizeExcessProperties(editor, childEntry)) {
            return;
          }
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

export const createNormalizePlainTextBlockPlugin = getPlatePluginWithOverrides(
  withNormalizePlainTextBlock
);
