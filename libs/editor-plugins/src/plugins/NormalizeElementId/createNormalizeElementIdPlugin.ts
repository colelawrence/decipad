import { createTPluginFactory } from '@decipad/editor-types';
import { withOverrides } from './withOverrides';

const pluginKey = 'NORMALIZE_ELEMENT_ID_PLUGIN';

export const createNormalizeElementIdPlugin = createTPluginFactory({
  key: pluginKey,
  withOverrides: withOverrides(pluginKey),
});
