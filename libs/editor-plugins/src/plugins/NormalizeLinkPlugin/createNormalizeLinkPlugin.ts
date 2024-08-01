/* eslint-disable no-param-reassign */
import type { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { ELEMENT_LINK } from '@decipad/editor-types';
import {
  getNodeChildren,
  getNodeString,
  isElement,
  unwrapNodes,
} from '@udecode/plate-common';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import {
  createNormalizerPluginFactory,
  normalizeExcessProperties,
} from '@decipad/editor-plugin-factories';

const normalizeLink =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;

    if (isElement(node) && node.type === ELEMENT_LINK) {
      const normalize = normalizeExcessProperties(editor, entry, ['url']);
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

export const createNormalizeLinkPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_LINK_PLUGIN',
  plugin: normalizeLink,
});
