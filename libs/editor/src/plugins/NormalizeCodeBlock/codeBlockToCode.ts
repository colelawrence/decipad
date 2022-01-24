import { CodeBlockElement, CodeLineElement } from '../../utils/elements';

function codeLineToCode(line: CodeLineElement): string {
  return line.children[0].text;
}

export function codeBlockToCode(codeBlock: CodeBlockElement): string {
  return codeBlock.children.map(codeLineToCode).join('\n');
}
