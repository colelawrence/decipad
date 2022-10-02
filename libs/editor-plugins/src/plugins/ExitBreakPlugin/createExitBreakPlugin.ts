import { createPluginFactory } from '@udecode/plate';
import { onKeyDownExitBreak } from './onKeyDownExitBreak';

export const KEY_EXIT_BREAK = 'exitBreak';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const createExitBreakPlugin = createPluginFactory({
  key: KEY_EXIT_BREAK,
  handlers: {
    onKeyDown: onKeyDownExitBreak,
  },
  options: {
    rules: [
      { hotkey: 'mod+enter' },
      { hotkey: 'mod+shift+enter', before: true },
    ],
  },
});
