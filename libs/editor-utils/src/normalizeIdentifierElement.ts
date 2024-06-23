import { identifierRegExpGlobal } from '@decipad/remote-computer';
import {
  type ENodeEntry,
  getNodeString,
  insertText,
  type Value,
} from '@udecode/plate-common';
import type { MyGenericEditor, MyValue } from '@decipad/editor-types';
import { Path } from 'slate';
import type { PromiseOrType } from '@decipad/utils';

export const normalizeIdentifierElement = <
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
>(
  editor: TE,
  [node, path]: ENodeEntry<TV>,
  getUniqueName?: () => PromiseOrType<string>
): false | (() => unknown) => {
  const text = getNodeString(node);
  const { selection } = editor;

  const replacement =
    text
      .replaceAll(' ', '')
      .match(new RegExp(identifierRegExpGlobal))
      ?.join('') || '';
  if (replacement !== text) {
    return () => insertText(editor, replacement, { at: path });
  }

  /** If the user is NOT on the given path, then we can
   * safely normalize without disturbing the user IF the column is empty.
   * We already have a hook that handles this but on copy the table can come
   * unnamed.
   */

  if (
    getUniqueName &&
    text.length === 0 &&
    !Path.equals(selection?.anchor.path || [-1], path)
  ) {
    return async () => insertText(editor, await getUniqueName(), { at: path });
  }

  return false;
};
