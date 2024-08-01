/* eslint-disable no-param-reassign */
import type { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { markKinds } from '@decipad/editor-types';
import { isText } from '@udecode/plate-common';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import {
  createNormalizerPluginFactory,
  normalizeExcessProperties,
} from '@decipad/editor-plugin-factories';

const normalizeTextPlugin =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node] = entry;

    if (isText(node)) {
      return normalizeExcessProperties(editor, entry, Object.values(markKinds));
    }
    return false;
  };

export const createNormalizeTextPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_TEXT_PLUGIN',
  plugin: normalizeTextPlugin,
});
