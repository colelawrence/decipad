/* eslint-disable no-param-reassign */
import { markKinds, MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { isText } from '@udecode/plate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeTextPlugin = (editor: MyEditor) => (entry: MyNodeEntry) => {
  const [node] = entry;

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
