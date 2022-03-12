/* eslint-disable no-param-reassign */
import {
  WithOverride,
  TNode,
  getPlatePluginWithOverrides,
  isText,
} from '@udecode/plate';
import { NodeEntry } from 'slate';
import { markKinds } from '@decipad/editor-types';
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
