/* eslint-disable no-param-reassign */
import { ELEMENT_LINK } from '@decipad/editor-types';
import {
  getPlatePluginWithOverrides,
  isElement,
  TNode,
  WithOverride,
} from '@udecode/plate';
import { Node, NodeEntry, Transforms } from 'slate';
import { normalizeExcessProperties } from '../../utils/normalize';

const withNormalizeLink = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (node.type === ELEMENT_LINK) {
      if (normalizeExcessProperties(editor, entry, ['url'])) {
        return;
      }

      if (!('url' in node) || Node.string(node) === '') {
        Transforms.unwrapNodes(editor, { at: path });
        return;
      }

      for (const childEntry of Node.children(editor, path)) {
        const [childNode, childPath] = childEntry as NodeEntry<TNode>;

        if (isElement(childNode)) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

export const createNormalizeLinkPlugin =
  getPlatePluginWithOverrides(withNormalizeLink);
