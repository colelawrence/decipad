import type { MyGenericEditor } from '@decipad/editor-types';
import { ELEMENT_LIVE_QUERY_QUERY } from '@decipad/editor-types';
import { createOnKeyDownPluginFactory } from '@decipad/editor-plugin-factories';
import { getSoftBreakOnKeyDown } from '../SoftBreakPlugin/getSoftBreakOnKeyDown';
import type { Value } from '@udecode/plate-common';

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
