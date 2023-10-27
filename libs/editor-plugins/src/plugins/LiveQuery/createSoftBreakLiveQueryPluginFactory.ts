import {
  ELEMENT_LIVE_QUERY_QUERY,
  MyGenericEditor,
} from '@decipad/editor-types';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { getSoftBreakOnKeyDown } from '../SoftBreakPlugin/getSoftBreakOnKeyDown';
import { Value } from '@udecode/plate';

export const createSoftBreakLiveQueryPluginFactory = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>() =>
  createOnKeyDownPluginFactory<TV, TE>({
    name: 'SOFT_BREAK_LIVE_QUERY_QUERY_PLUGIN',
    plugin: getSoftBreakOnKeyDown<TV, TE>({
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
