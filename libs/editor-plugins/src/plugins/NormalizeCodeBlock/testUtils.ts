import {
  CodeBlockElement,
  CodeLineElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@decipad/editor-types';

export function codeLine(code: string): CodeLineElement {
  return {
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: code,
      },
    ],
  } as CodeLineElement;
}

export function codeBlock(
  ...codeLines: Omit<CodeLineElement, 'id'>[]
): CodeBlockElement {
  return {
    type: ELEMENT_CODE_BLOCK,
    children: codeLines as CodeLineElement[],
  } as CodeBlockElement;
}
