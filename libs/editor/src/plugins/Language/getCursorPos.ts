import { isCollapsed } from '@udecode/plate';
import { Editor, Range } from 'slate';
import { getCodeFromBlock, isSlateNode } from './common';

function offsetToLineNumber(codeText: string, offset: number) {
  const lines = codeText
    .split('\n')
    .map((line) => line.length)
    .reduce(
      (cumulativeSums, next) => [
        ...cumulativeSums,
        (cumulativeSums[cumulativeSums.length - 1] ?? 0) + next,
      ],
      [] as number[]
    )
    .map((line, i) => line + i);

  let c = offset;
  let foundLine = lines.length + 1;
  lines.forEach((line: number) => {
    if (c > line) return;
    c -= line;
    foundLine -= 1;
  });

  return foundLine;
}

export type CursorPos = [string, number];

export function getCursorPos(editor: Editor): CursorPos | null {
  const { selection } = editor;

  if (selection && isCollapsed(selection)) {
    const cursor = Range.start(selection);

    const codeBlock = Editor.above(editor, {
      at: cursor,
      match: (node) => isSlateNode(node) && node.type === 'code_block',
    })?.[0];

    if (isSlateNode(codeBlock)) {
      const codeText = getCodeFromBlock(codeBlock);
      const foundLine = offsetToLineNumber(codeText, cursor.offset);

      return [codeBlock.id, foundLine];
    }
  }

  return null;
}
