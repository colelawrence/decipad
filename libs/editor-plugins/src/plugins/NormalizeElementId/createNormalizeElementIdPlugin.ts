import { MyGenericEditor, createTPluginFactory } from '@decipad/editor-types';
import { withOverrides } from './withOverrides';
import { createNormalizerPlugin } from '../../pluginFactories/normalizerPlugin';
import { normalizeElementIdPlugin } from './normalizeElementIdPlugin';
import { Value } from '@udecode/plate';

const pluginKey = 'NORMALIZE_ELEMENT_ID_PLUGIN';

export const createNormalizeElementIdPlugin = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>() =>
  createTPluginFactory<object, TV, TE>({
    key: pluginKey,
    plugins: [
      {
        key: `${pluginKey}_OVERRIDES`,
        withOverrides: withOverrides<TV, TE>(pluginKey),
      },
      createNormalizerPlugin<TV, TE>({
        name: `${pluginKey}_NORMALIZER`,
        plugin: normalizeElementIdPlugin<TV, TE>(),
      }),
    ],
  });
