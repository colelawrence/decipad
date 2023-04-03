import { identifierRegExpGlobal } from '@decipad/computer';
import { getNodeString, insertText, TNodeEntry } from '@udecode/plate';
import { MyEditor } from '@decipad/editor-types';
import { Path } from 'slate';

export const normalizeIdentifierElement = (
  editor: MyEditor,
  [node, path]: TNodeEntry,
  getUniqueName?: () => string
): boolean => {
  const text = getNodeString(node);
  const { selection } = editor;

  const replacement =
    text.match(new RegExp(identifierRegExpGlobal))?.join('') || '';
  if (replacement !== text) {
    insertText(editor, replacement, { at: path });
    return true;
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
    insertText(editor, getUniqueName(), { at: path });
    return true;
  }
  return false;
};
