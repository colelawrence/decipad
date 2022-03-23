/* eslint-disable no-param-reassign */
import { Element } from '@decipad/editor-types';
import { isElement, setNodes, TNode } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Editor, NodeEntry } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';

const normalizeElementIdPlugin = (editor: Editor) => (entry: NodeEntry) => {
  const [node, path] = entry as NodeEntry<TNode>;

  if (isElement(node)) {
    if (!node.id) {
      setNodes<Element>(editor, { id: nanoid() }, { at: path });
      return true;
    }
  }

  return false;
};

export const createNormalizeElementIdPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_ELEMENT_ID_PLUGIN',
  plugin: normalizeElementIdPlugin,
});
