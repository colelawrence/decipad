/* eslint-disable no-param-reassign */
import { ELEMENT_IMAGE, MyEditor, MyNodeEntry } from '@decipad/editor-types';
import {
  getNodeChildren,
  getNodeString,
  isElement,
  unwrapNodes,
} from '@udecode/plate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeImage = (editor: MyEditor) => (entry: MyNodeEntry) => {
  const [node, path] = entry;

  if (isElement(node) && node.type === ELEMENT_IMAGE) {
    if (normalizeExcessProperties(editor, entry, ['url', 'width', 'caption'])) {
      return true;
    }

    if (!('url' in node) || getNodeString(node) === '') {
      unwrapNodes(editor, { at: path });
      return true;
    }

    for (const childEntry of getNodeChildren(editor, path)) {
      const [childNode, childPath] = childEntry;

      if (isElement(childNode)) {
        unwrapNodes(editor, { at: childPath });
        return true;
      }
    }
  }

  return false;
};

export const createNormalizeImagePlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_IMAGE_PLUGIN',
  plugin: normalizeImage,
});
