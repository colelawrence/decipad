import { isCollapsed } from '@udecode/slate-plugins';
import { Editor, Range, Text } from 'slate';

function offsetToLineNumber(codeText: string, offset: number) {
  const cumulativeSum = (
    (sum) => (value: number) =>
      (sum += value)
  )(0);

  const lines = codeText
    .split('\n')
    .map((line) => line.length)
    .map(cumulativeSum)
    .map((line, i) => line + i);

  let c = offset;
  let foundLine = lines.length + 1;
  lines.forEach((line: number) => {
    if (c > line) return;
    c -= line;
    foundLine--;
  });

  return foundLine;
}

export type CursorPos = [string, number];

export function getCursorPos(editor: Editor): CursorPos | null {
  const { selection } = editor;

  if (selection && isCollapsed(selection)) {
    const cursor = Range.start(selection);

    const [parentNode] = Editor.parent(editor, cursor) as any;
    const [node] = Editor.node(editor, cursor);

    const isCodeBlock = parentNode.type === 'code_block';

    if (isCodeBlock && Text.isText(node)) {
      const foundLine = offsetToLineNumber(node.text, cursor.offset);

      return [parentNode.id, foundLine];
    }
  }

  return null;
}
