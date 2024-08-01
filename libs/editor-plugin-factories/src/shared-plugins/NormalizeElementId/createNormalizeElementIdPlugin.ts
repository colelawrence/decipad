import type { MyGenericEditor } from '@decipad/editor-types';
import { createMyPluginFactory } from '@decipad/editor-types';
import { withOverrides } from './withOverrides';
import { normalizeElementIdPlugin } from './normalizeElementIdPlugin';
import type { Value } from '@udecode/plate-common';
import { createNormalizerPlugin } from '../../normalizerPlugin';

const pluginKey = 'NORMALIZE_ELEMENT_ID_PLUGIN';

export const createNormalizeElementIdPlugin = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>() =>
  createMyPluginFactory<object, TV, TE>({
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
