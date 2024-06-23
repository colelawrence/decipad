import { type NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import { ELEMENT_TD } from '@decipad/editor-types';
import {
  type PlateEditor,
  type Value,
  getChildren,
} from '@udecode/plate-common';
import { createNormalizerPluginFactory } from '@decipad/editor-plugin-factories';
import { normalizeExcessProperties } from '../../../editor-plugins/src/utils/normalize';

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
