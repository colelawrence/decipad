/* eslint-disable no-param-reassign */
import { markKinds } from '@decipad/editor-types';
import {
  getPlatePluginWithOverrides,
  isText,
  TNode,
  WithOverride,
} from '@udecode/plate';
import { NodeEntry } from 'slate';
import { normalizeExcessProperties } from '../../utils/normalize';

const withNormalizeTextPlugin = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node] = entry as NodeEntry<TNode>;

    if (isText(node)) {
      if (normalizeExcessProperties(editor, entry, Object.values(markKinds))) {
        return;
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

export const createNormalizeTextPlugin = getPlatePluginWithOverrides(
  withNormalizeTextPlugin
);
