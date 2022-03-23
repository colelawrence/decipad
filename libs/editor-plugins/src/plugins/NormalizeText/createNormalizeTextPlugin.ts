/* eslint-disable no-param-reassign */
import { markKinds } from '@decipad/editor-types';
import { isText, TNode } from '@udecode/plate';
import { Editor, NodeEntry } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeTextPlugin = (editor: Editor) => (entry: NodeEntry) => {
  const [node] = entry as NodeEntry<TNode>;

  if (isText(node)) {
    if (normalizeExcessProperties(editor, entry, Object.values(markKinds))) {
      return true;
    }
  }

  return false;
};

export const createNormalizeTextPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_TEXT_PLUGIN',
  plugin: normalizeTextPlugin,
});
