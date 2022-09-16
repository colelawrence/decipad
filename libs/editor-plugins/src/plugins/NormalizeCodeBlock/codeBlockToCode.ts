import {
  DeprecatedCodeBlockElement,
  CodeLineElement,
} from '@decipad/editor-types';

function codeLineToCode(line: CodeLineElement): string {
  return line.children[0].text;
}

export function codeBlockToCode(
  codeBlock: Omit<DeprecatedCodeBlockElement, 'id'>
): string {
  return (codeBlock as DeprecatedCodeBlockElement).children
    .map(codeLineToCode)
    .join('\n');
}
