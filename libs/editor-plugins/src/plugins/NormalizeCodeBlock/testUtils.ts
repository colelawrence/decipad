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

export function emptyCodeBlock(): CodeBlockElement {
  return {
    type: ELEMENT_CODE_BLOCK,
    children: [codeLine('')],
  } as CodeBlockElement;
}

export function exampleCodeBlock(): CodeBlockElement {
  return {
    type: ELEMENT_CODE_BLOCK,
    children: [codeLine('a = 1'), codeLine('t = {\n\n}'), codeLine('b = 2')],
  } as CodeBlockElement;
}
