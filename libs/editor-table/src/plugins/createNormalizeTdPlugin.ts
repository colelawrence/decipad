import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '@decipad/editor-plugins';
import { ELEMENT_TD } from '@decipad/editor-types';
import { PlateEditor, Value, getChildren } from '@udecode/plate';
import { normalizeExcessProperties } from 'libs/editor-plugins/src/utils/normalize';

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
          const normalize = normalizeExcessProperties(editor, child);
          if (normalize) {
            return normalize;
          }
        }

        return false;
      },
  })();
