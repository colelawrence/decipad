import { createTPluginFactory } from '@decipad/editor-types';
import { withOverrides } from './withOverrides';
import { createNormalizerPlugin } from '../../pluginFactories/normalizerPlugin';
import { normalizeElementIdPlugin } from './normalizeElementIdPlugin';

const pluginKey = 'NORMALIZE_ELEMENT_ID_PLUGIN';

export const createNormalizeElementIdPlugin = createTPluginFactory({
  key: pluginKey,
  plugins: [
    {
      key: `${pluginKey}_OVERRIDES`,
      withOverrides: withOverrides(pluginKey),
    },
    createNormalizerPlugin({
      name: `${pluginKey}_NORMALIZER`,
      plugin: normalizeElementIdPlugin,
    }),
  ],
});
