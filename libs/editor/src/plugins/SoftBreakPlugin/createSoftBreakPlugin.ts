import { PlatePlugin } from '@udecode/plate';
import { ELEMENT_CODE_LINE, ELEMENT_BLOCKQUOTE } from '@decipad/editor-types';
import { filterStatementSeparator } from './filterStatementSeparator';
import { getSoftBreakOnKeyDown } from './getSoftBreakOnKeyDown';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const createSoftBreakPlugin = (): // options: SoftBreakPluginOptions = {}
PlatePlugin => ({
  onKeyDown: getSoftBreakOnKeyDown({
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
          allow: [ELEMENT_BLOCKQUOTE],
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
