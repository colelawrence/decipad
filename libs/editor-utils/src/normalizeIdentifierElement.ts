import { Editor, ElementEntry, Node, Transforms } from 'slate';
import { identifierRegExpGlobal } from '@decipad/computer';

export const normalizeIdentifierElement = (
  editor: Editor,
  [element, path]: ElementEntry
): boolean => {
  const leaf = element.children[0];
  const text = Node.string(leaf);
  const replacement =
    text.match(new RegExp(identifierRegExpGlobal))?.join('') || '';
  if (replacement !== text) {
    Transforms.insertText(editor, replacement, { at: [...path, 0] });
    return true;
  }
  return false;
};
