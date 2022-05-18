import { Editor, NodeEntry, Node, Text, Transforms } from 'slate';
import { identifierRegExpGlobal } from '@decipad/computer';

export const normalizeIdentifierElement = (
  editor: Editor,
  [node, path]: NodeEntry<Text>
): boolean => {
  const text = Node.string(node);
  const replacement =
    text.match(new RegExp(identifierRegExpGlobal))?.join('') || '';
  if (replacement !== text) {
    Transforms.insertText(editor, replacement, { at: path });
    return true;
  }
  return false;
};
