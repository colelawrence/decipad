import { identifierRegExpGlobal } from '@decipad/computer';
import { getNodeString, insertText, TNodeEntry } from '@udecode/plate';
import { MyEditor } from '@decipad/editor-types';

export const normalizeIdentifierElement = (
  editor: MyEditor,
  [node, path]: TNodeEntry,
  getUniqueName?: () => string
): boolean => {
  const text = getNodeString(node);
  const replacement =
    text.match(new RegExp(identifierRegExpGlobal))?.join('') || '';
  if (replacement !== text) {
    insertText(editor, replacement, { at: path });
    return true;
  }

  if (getUniqueName && text.length === 0) {
    insertText(editor, getUniqueName(), { at: path });
    return true;
  }
  return false;
};
