import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '@decipad/editor-plugins';
import { ELEMENT_TD, MyEditor, MyNodeEntry } from '@decipad/editor-types';
import { getChildren } from '@udecode/plate';
import { normalizeExcessProperties } from 'libs/editor-plugins/src/utils/normalize';

export const createNormalizeTdPlugin = () =>
  createNormalizerPluginFactory({
    name: 'NORMALIZE_TD_PLUGIN',
    elementType: ELEMENT_TD,
    plugin:
      (editor: MyEditor) =>
      (entry: MyNodeEntry): NormalizerReturnValue => {
        for (const child of getChildren(entry)) {
          const normalize = normalizeExcessProperties(editor, child);
          if (normalize) {
            return normalize;
          }
        }

        return false;
      },
  })();
