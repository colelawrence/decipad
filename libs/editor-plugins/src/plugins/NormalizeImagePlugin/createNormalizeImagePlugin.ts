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
    const normalize = normalizeExcessProperties(editor, entry, [
      'url',
      'width',
      'caption',
    ]);
    if (normalize) {
      return normalize;
    }

    if (!('url' in node) || getNodeString(node) === '') {
      return () => unwrapNodes(editor, { at: path });
    }

    for (const childEntry of getNodeChildren(editor, path)) {
      const [childNode, childPath] = childEntry;

      if (isElement(childNode)) {
        return () => unwrapNodes(editor, { at: childPath });
      }
    }
  }

  return false;
};

export const createNormalizeImagePlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_IMAGE_PLUGIN',
  plugin: normalizeImage,
});
