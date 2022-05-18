/* eslint-disable no-param-reassign */
import { MyEditor, MyElement, MyNodeEntry } from '@decipad/editor-types';
import { isElement, setNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { createNormalizerPluginFactory } from '../../pluginFactories';

const normalizeElementIdPlugin = (editor: MyEditor) => (entry: MyNodeEntry) => {
  const [node, path] = entry;

  if (isElement(node)) {
    if (!node.id) {
      setNodes<MyElement>(editor, { id: nanoid() }, { at: path });
      return true;
    }
  }

  return false;
};

export const createNormalizeElementIdPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_ELEMENT_ID_PLUGIN',
  plugin: normalizeElementIdPlugin,
});
