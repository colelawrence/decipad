import { identifierRegExpGlobal } from '@decipad/computer';
import { ENodeEntry, getNodeString, insertText, Value } from '@udecode/plate';
import { MyGenericEditor, MyValue } from '@decipad/editor-types';
import { Path } from 'slate';

export const normalizeIdentifierElement = <
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
>(
  editor: TE,
  [node, path]: ENodeEntry<TV>,
  getUniqueName?: () => string
): false | (() => void) => {
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
    return () => insertText(editor, getUniqueName(), { at: path });
  }

  return false;
};
