import {
  getBlockAbove,
  KeyboardHandler,
  queryNode,
  TEditor,
  AnyObject,
  TNode,
} from '@udecode/plate';
import isHotkey from 'is-hotkey';
import { NodeEntry } from 'slate';

export interface QueryNodeOptions {
  /**
   * Query the node entry.
   */
  filter?: (editor: TEditor<AnyObject>) => (entry: NodeEntry<TNode>) => boolean;
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
  query?: QueryNodeOptions;
}

export interface SoftBreakOnKeyDownOptions {
  rules?: SoftBreakRule[];
}

// NOTE: this code is pretty similar to
// https://github.com/udecode/plate/blob/cbbf813229567b066ff6f7f52537cea4a6841b3d/packages/editor/break/src/soft-break/onKeyDownSoftBreak.ts
// except that it allows for the filter function to receive the editor in a
// curry'd way, eg. (editor: TEditor) => (entry: NodeEntry) => boolean, which
// was needed for this soft break plugin to work.
export const getSoftBreakOnKeyDown =
  ({
    rules = [{ hotkey: 'shift+enter' }],
  }: SoftBreakOnKeyDownOptions = {}): KeyboardHandler =>
  (editor) =>
  (event) => {
    const entry = getBlockAbove(editor);
    if (!entry) return;

    rules.forEach(({ hotkey, query }) => {
      if (
        isHotkey(hotkey, { byKey: true }, event) &&
        queryNode(entry, { ...query, filter: query?.filter?.(editor) })
      ) {
        event.preventDefault();

        editor.insertText('\n');
      }
    });
  };
