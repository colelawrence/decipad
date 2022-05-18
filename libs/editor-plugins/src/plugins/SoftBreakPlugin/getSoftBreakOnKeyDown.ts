import { getBlockAbove, queryNode, QueryNodeOptions } from '@udecode/plate';
import isHotkey from 'is-hotkey';
import {
  BlockElement,
  MyEditor,
  MyKeyboardHandler,
  MyNodeEntry,
} from '@decipad/editor-types';

export interface MyQueryNodeOptions {
  /**
   * Query the node entry.
   */
  filter?: (editor: MyEditor) => (entry: MyNodeEntry) => boolean;
  /**
   * List of types that are valid. If empty or undefined - allow all.
   */
  allow?: string[] | string;
  /**
   * List of types that are invalid.
   */
  exclude?: string[] | string;
}

export interface SoftBreakRule {
  hotkey: string;
  /**
   * Filter the block types where the rule applies.
   */
  query?: MyQueryNodeOptions;
}

export interface SoftBreakOnKeyDownOptions {
  rules?: SoftBreakRule[];
}

// NOTE: this code is pretty similar to
// https://github.com/udecode/plate/blob/cbbf813229567b066ff6f7f52537cea4a6841b3d/packages/editor/break/src/soft-break/onKeyDownSoftBreak.ts
// except that it allows for the filter function to receive the editor in a
// curry'd way, eg. (editor: MyEditor) => (entry: MyNodeEntry) => boolean, which
// was needed for this soft break plugin to work.
export const getSoftBreakOnKeyDown =
  ({
    rules = [{ hotkey: 'shift+enter' }],
  }: SoftBreakOnKeyDownOptions = {}): MyKeyboardHandler =>
  (editor) =>
  (event) => {
    const entry = getBlockAbove<BlockElement>(editor);
    if (!entry) return;

    rules.forEach(({ hotkey, query }) => {
      if (
        isHotkey(hotkey, { byKey: true }, event) &&
        queryNode<BlockElement>(entry, {
          ...query,
          filter: query?.filter?.(editor),
        } as QueryNodeOptions)
      ) {
        event.preventDefault();

        editor.insertText('\n');
      }
    });
  };
