import { CodeBlockElement, CodeLineElement } from '@decipad/editor-types';

function codeLineToCode(line: CodeLineElement): string {
  return line.children[0].text;
}

export function codeBlockToCode(
  codeBlock: Omit<CodeBlockElement, 'id'>
): string {
  return codeBlock.children.map(codeLineToCode).join('\n');
}
