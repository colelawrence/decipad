/* eslint-disable no-param-reassign */
import { ELEMENT_LINK } from '@decipad/editor-types';
import { isElement, TNode } from '@udecode/plate';
import { Editor, Node, NodeEntry, Transforms } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeLink = (editor: Editor) => (entry: NodeEntry) => {
  const [node, path] = entry as NodeEntry<TNode>;

  if (node.type === ELEMENT_LINK) {
    if (normalizeExcessProperties(editor, entry, ['url'])) {
      return true;
    }

    if (!('url' in node) || Node.string(node) === '') {
      Transforms.unwrapNodes(editor, { at: path });
      return true;
    }

    for (const childEntry of Node.children(editor, path)) {
      const [childNode, childPath] = childEntry as NodeEntry<TNode>;

      if (isElement(childNode)) {
        Transforms.unwrapNodes(editor, { at: childPath });
        return true;
      }
    }
  }

  return false;
};

export const createNormalizeLinkPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_LINK_PLUGIN',
  plugin: normalizeLink,
});
