import { type NormalizerReturnValue } from '@decipad/editor-plugins';
import { ELEMENT_TD } from '@decipad/editor-types';
import {
  type PlateEditor,
  type Value,
  getChildren,
} from '@udecode/plate-common';
import { normalizeExcessProperties } from '../../../editor-plugins/src/utils/normalize';
import { createNormalizerPluginFactory } from '../../../editor-plugins/src/pluginFactories/normalizerPlugin';

const restrictedChildren = ['img'];
export const createNormalizeTdPlugin = <
  TV extends Value,
  TE extends PlateEditor<TV>
>() =>
  createNormalizerPluginFactory<TV, TE>({
    name: 'NORMALIZE_TD_PLUGIN',
    elementType: ELEMENT_TD,
    plugin:
      (editor) =>
      (entry): NormalizerReturnValue => {
        for (const child of getChildren(entry)) {
          if (restrictedChildren.includes(child[0].type as string)) {
            editor.removeNodes({ at: child[1] });
          }
          const normalize = normalizeExcessProperties(editor, child);
          if (normalize) {
            return normalize;
          }
        }

        return false;
      },
  })();
