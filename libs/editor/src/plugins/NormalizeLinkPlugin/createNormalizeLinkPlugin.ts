/* eslint-disable no-param-reassign */
import {
  WithOverride,
  TNode,
  getPlatePluginWithOverrides,
  isElement,
  setNodes,
} from '@udecode/plate';
import { Node, NodeEntry, Transforms } from 'slate';
import { ELEMENT_LINK } from '../../elements';
import { normalizeExcessProperties } from '../../utils/normalize';

const withNormalizeLink = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (node.type === ELEMENT_LINK) {
      if (normalizeExcessProperties(editor, entry, ['url'])) {
        return;
      }

      if (!('url' in node)) {
        setNodes(editor, { url: '' }, { at: path });
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
