import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { filterStatementSeparator } from './filterStatementSeparator';
import { getSoftBreakOnKeyDown } from './getSoftBreakOnKeyDown';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const createSoftBreakPlugin = createOnKeyDownPluginFactory({
  name: 'SOFT_BREAK_PLUGIN',
  plugin: getSoftBreakOnKeyDown({
    rules: [
      {
        hotkey: 'shift+enter',
        query: {
          exclude: [ELEMENT_CODE_LINE],
        },
      },
      {
        hotkey: 'enter',
        query: {
          allow: [ELEMENT_CODE_LINE],
          filter: filterStatementSeparator,
        },
      },
    ],
  }),
});
