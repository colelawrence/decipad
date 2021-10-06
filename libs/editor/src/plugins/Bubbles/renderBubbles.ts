import { ELEMENT_CODE_LINE } from '@udecode/plate';
import { Editor, Node, Path, Range, Text } from 'slate';
import { tokenize } from '@decipad/language';

const getAssignedIdentifiers = (codeLines: Text[]) =>
  tokenize(codeLines.map((text) => text.text).join('\n'))
    .filter((tok) => tok.type !== 'ws')
    .filter(
      (currentTok, i, all) =>
        currentTok.type === 'identifier' && all[i + 1]?.type === 'equalSign'
    );

export const getBubbleRanges = (codeLines: Text[], path: Path): Range[] => {
  return getAssignedIdentifiers(codeLines).map((ident) => {
    return {
      bubble: true,
      variable: ident.text,
      anchor: { path, offset: ident.offset },
      focus: { path, offset: ident.offset + ident.text.length },
    } as Range;
  });
};

export const renderBubble =
  (editor: Editor) =>
  ([node, path]: [node: Node, path: Path]): Range[] => {
    if (node === editor) return [];

    const [parentNode] = Editor.parent(editor, path);

    // TODO fix node types
    /* eslint-disable @typescript-eslint/no-explicit-any */

    if (!parentNode || (parentNode as any).type !== ELEMENT_CODE_LINE) {
      return [];
    }

    if (!Text.isText(node)) {
      return [];
    }

    return getBubbleRanges(parentNode.children as Text[], path);
  };
