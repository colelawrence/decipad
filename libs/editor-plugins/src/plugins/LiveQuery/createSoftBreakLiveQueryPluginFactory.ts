import { ELEMENT_LIVE_QUERY_QUERY } from '@decipad/editor-types';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { getSoftBreakOnKeyDown } from '../SoftBreakPlugin/getSoftBreakOnKeyDown';

export const createSoftBreakLiveQueryPluginFactory =
  createOnKeyDownPluginFactory({
    name: 'SOFT_BREAK_LIVE_QUERY_QUERY_PLUGIN',
    plugin: getSoftBreakOnKeyDown({
      rules: [
        {
          hotkey: 'enter',
          query: {
            allow: [ELEMENT_LIVE_QUERY_QUERY],
          },
        },
      ],
    }),
  });
