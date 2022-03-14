/* eslint-disable no-param-reassign */
import { Element } from '@decipad/editor-types';
import {
  getPlatePluginWithOverrides,
  isElement,
  setNodes,
  TNode,
  WithOverride,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { NodeEntry } from 'slate';

const withNormalizeElementIdPlugin = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (isElement(node)) {
      if (!node.id) {
        setNodes<Element>(editor, { id: nanoid() }, { at: path });
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

export const createNormalizeElementIdPlugin = getPlatePluginWithOverrides(
  withNormalizeElementIdPlugin
);
