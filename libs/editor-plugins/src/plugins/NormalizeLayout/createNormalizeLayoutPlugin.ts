/* eslint-disable no-param-reassign */
import type { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { ELEMENT_LAYOUT } from '@decipad/editor-types';
import {
  TElement,
  getNodeChildren,
  getParentNode,
  isElement,
  isText,
  liftNodes,
  removeNodes,
  unsetNodes,
  unwrapNodes,
} from '@udecode/plate-common';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import { createNormalizerPluginFactory } from '@decipad/editor-plugin-factories';
import { isColumnableKind } from '@decipad/editor-utils';

const normalizeLayout =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node, path] = entry;
    if (isElement(node) && node.type === ELEMENT_LAYOUT) {
      // Unwrap single-column layouts with default width
      if (
        node.children.length === 1 &&
        (node.width ?? 'default') === 'default'
      ) {
        return () => unwrapNodes(editor, { at: path });
      }

      // Make sure all children can appear as a column
      for (const childEntry of getNodeChildren(editor, path)) {
        const [childNode, childPath] = childEntry;

        if (
          isText(childNode) ||
          (isElement(childNode) && !isColumnableKind(childNode.type))
        ) {
          return () => liftNodes(editor, { at: childPath });
        }
      }

      // Remove empty layouts
      if (node.children.length === 0) {
        return () => removeNodes(editor, { at: path });
      }
    }

    // Remove columnWidth from elements outside layout
    const parentNode = getParentNode(editor, path)?.[0];
    if (
      isElement(node) &&
      'columnWidth' in node &&
      (!isElement(parentNode) || parentNode.type !== ELEMENT_LAYOUT)
    ) {
      return () => unsetNodes<TElement>(editor, ['columnWidth'], { at: path });
    }

    return false;
  };

export const createNormalizeLayoutPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_LAYOUT_PLUGIN',
  plugin: normalizeLayout,
});
