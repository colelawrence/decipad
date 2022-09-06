import {
  ELEMENT_CODE_LINE,
  ELEMENT_TABLE_COLUMN_FORMULA,
} from '@decipad/editor-types';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
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
          exclude: [ELEMENT_CODE_LINE, ELEMENT_TABLE_COLUMN_FORMULA],
        },
      },
    ],
  }),
});
